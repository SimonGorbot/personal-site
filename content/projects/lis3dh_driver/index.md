---
title: "Safe Sensor Drivers Using Rust's Type System"
date: 2025-08-05
type: 'project'

tags: ["Rust", "Embedded"]

summary: "Using the typestate design pattern with Rust's compiler to enforce proper hardware configuration."
description: "How can we use the Typestate design pattern in Rust to help the compiler check hardware configuration."
weight: 1
---
## Background

During my previous internship at [Fourier](https://fourier.earth), I started my Embedded Rust development journey. I had previously written small amounts of Rust, but I would by no means say I knew the language at the time. One of Fourier's embedded systems engineers is a very passionate Embedded Rust developer. He is the one who introduced to the **Typestate** pattern.

>The typestate pattern is an API design pattern that encodes information about an object’s run-time state in its compile-time type. In particular, >an API using the typestate pattern will have:
>
>
> 1. Operations on an object (such as methods or functions) that are only available when the object is in certain states,</li>
> 2. A way of encoding these states at the type level, such that attempts to use the operations in the wrong state fail to compile,
> 3. State transition operations (methods or functions) that change the type-level state of objects in addition to, or instead of, changing run-time dynamic state, such that the operations in the previous state are no longer possible.
>
>
>
>This is useful because:
>
>1. It moves certain types of errors from run-time to compile-time, giving programmers faster feedback.</li>
>2. It interacts nicely with IDEs, which can avoid suggesting operations that are illegal in a certain state.</li>
>3. It can eliminate run-time checks, making code faster/smaller.
>
>This great explanation is taken from [Cliffle's](https://cliffle.com/) blog post ["The Typestate Pattern in Rust"](https://cliffle.com/blog/rust-typestate/)

[Adin](https://adinack.dev/)<sub>(the aforementioned Embedded Rust co-worker)</sub>, showed me how we can leverage this design pattern that is so easy to implement in Rust to extend the capabilities of the Rust compiler to validate your hardware configurations.
My use of the Typestate pattern in the crate is heavily inspired by work done by Adin in his pursuit of creating tools to generate better HALs. Read more about Adin's work [here](https://adinack.dev/blog/better-hals-first-look/).

## Registers

Consider if we were to represent the hardware states within register fields as types in the Rust type system. The hardware states in the fields of registers are represented as type-states.

Type-states are marker types that directly correspond to hardware states.
Hardware states are exposed as values of register bit-fields. For any type-state there is going to be a physical value that will be in the physical register. That physical value is referred to as the raw value. For any field, all of the possible hardware states it may in-habit are represented as a variant of an enum named `Variant`. Type-states will implement a trait named `State` which contains a constant `VARIANT` of the type `Variant` and value corresponding to the raw value to achieve the represented hardware state.

Consider:
A device has multiple sensors. Sensor 1 can be enabled or disabled, as well as have its measurement range changed. This chip is very picky though, and if the sensor is disabled, it's range must be set to a specific value otherwise it exhibits undefined behaviour.

 ```rust
 pub mod sensor_1_enable {
    pub trait State {
        const VARIANT: Variant;
    }
    
    #[repr(u8)]
    pub enum Variant {
        SensorEnabled = 0b0,
        SensorDisabled = 0b1,
    }
    pub struct SensorEnabled;
    pub struct SensorDisabled;
    impl State for SensorEnabled {
        const VARIANT: Variant = Variant::SensorEnabled;
    }
    impl State for SensorDisabled {
        const VARIANT: Variant = Variant::SensorDisabled;
    }
}
 pub mod sensor_1_range {
    pub trait State {
        const VARIANT: Variant;
    }
    
    #[repr(u8)]
    pub enum Variant {
        RangeDisabled = 0b00,
        Range1 = 0b01,
        Range2 = 0b10,
        Range3 = 0b11,
    }
    pub struct RangeDisabled;
    pub struct Range1;
    pub struct Range2;
    pub struct Range3;
    impl State for RangeDisabled {
        const VARIANT: Variant = Variant::RangeDisabled;
    }
    impl State for Range1 {
        const VARIANT: Variant = Variant::Range1;
    }
    impl State for Range2 {
        const VARIANT: Variant = Variant::Range2;
    }
     impl State for Range3 {
        const VARIANT: Variant = Variant::Range1;
    }
}
```

### Entitlements

The Entitled trait is used to express inter-bit-field relationships in the type system.
For example, if sensor_1_range can only be set to one of the options: {`Range1`, `Range2`, and `Range3`}, if `sensor_1_enable` is set to `SensorEnabled`, then one could say that the Type-States Range1, Range2, and Range3 of `sensor_1_range` are Entitled to the Type-State SensorEnabled of `sensor_1_enable`.
The mandatory hardware state of the sensor range bit-field when the sensor is disabled can be enforced by the compiler using Entitlements.
In code this would look like:

```rust
 // The compiler enforces that sensor 1 can only be disabled if the sensor range is set to disabled.
 impl Entitled<sensor_1_range::RangeDisabled> for sensor_1_enable::SensorDisabled {}
 // The rest of the ranges, naturally, require the sensor to be enabled.
 impl Entitled<sensor_1_enable::SensorEnabled> for sensor_1_range::Range1 {}
 impl Entitled<sensor_1_enable::SensorEnabled> for sensor_1_range::Range2 {}
 impl Entitled<sensor_1_enable::SensorEnabled> for sensor_1_range::Range3 {}
 ```

 In summary,
 Type-states express hardware states.
 The type relationships (as expressed by the `Entitled` trait) provide a proxy for the true hardware relationships.
 The resulting structures facilitate correct hardware usage.

## Properties

Properties are values that are derived from multiple hardware-states of the sensor but aren't values that are directly written to registers.
Continuing on from our previous example, lets say sensor_1's measurement resolution is derived from the sensor measurement range and a new hardware state called `power_mode` that is defined below:

```rust
 pub mod sensor_1_power_mode {
    pub trait State {
        const VARIANT: Variant;
    }
    
    #[repr(u8)]
    pub enum Variant {
        LowPower = 0b0,
        NormalPower = 0b1,
    }
    pub struct LowPower; 
    pub struct NormalPower;

    impl State for LowPower {
        const VARIANT: Variant = Variant::LowPower;
    }
    impl State for NormalPower {
        const VARIANT: Variant = Variant::NormalPower;
    }
}
```

Maybe the highest sensor measurement range (`sensor_1_range::Range3`) isn't available when it is configured in low power mode (`sensor_1_power_mode::LowPower`). Again, we can tell the compiler to enforce this hardware constraint using the `Entitled` trait.

```rust
// Sensor ranges 1 and 2 can be used in any power mode state. 
impl<T: sensor_1_power_mode::State> Entitled<T> for sensor_1_range::Range1 {}
impl<T: sensor_1_power_mode::State> Entitled<T> for sensor_1_range::Range2 {}
// Sensor range 3 can exclusively be used in normal power mode.
impl Entitled<sensor_1_power_mode::NormalPower> for sensor_1_range::Range3 {}
```

Then we can define the property like so:

```rust
pub mod resolution {
    #[derive(PartialEq)]
    #[repr(u8)]
    pub enum Variant {
        R8Bit = 8,
        R16Bit = 16,
    }

    pub trait Property {
        const VARIANT: Variant;
    }

    pub struct Resolution<R, Pm>
    where
        R: sensor_1_range::State,
        Pm: sensor_1_power_mode::State,
    {
        _p: core::marker::PhantomData<(R, Pm)>,
    }

    impl<R, Pm> Property for Resolution<R, Pm>
    where
        R: sensor_1_range::State,
        Pm: sensor_1_power_mode::State,
    {
        const VARIANT: Variant = {
            match (sensor_1_range::VARIANT, sensor_1_power_mode::VARIANT) {
                (sensor_1_range::Variant::Range1, sensor_1_power_mode::Variant::LowPower) => Variant::R8Bit,
                (sensor_1_range::Variant::Range1, sensor_1_power_mode::Variant::NormalPower) => Variant::R6Bit,
                (sensor_1_range::Variant::Range2, sensor_1_power_mode::Variant::LowPower) => Variant::R8Bit,
                (sensor_1_range::Variant::Range2, sensor_1_power_mode::Variant::NormalPower) => Variant::R16Bit,
                (sensor_1_range::Variant::Range3, sensor_1_power_mode::Variant::NormalPower) => Variant::R16Bit,
                (sensor_1_range::Variant::Range3, sensor_1_power_mode::Variant::LowPower) => unreachable!(),
            }
        };
    }
}
```

## Application

I made use of the typestate API to make my driver for the [lis3dh accelerometer](https://www.st.com/en/mems-and-sensors/lis3dh.html). The lis3dh has many intertwined hardware configuration options which has caused many of the available crates to not expose these features. I can't know for certain why features were not exposed, but to me it seems that without the typestate pattern, there isn't a way to guarantee correct configuration of the inter-dependent features without performing several run-time checks. The typestate pattern solves this issue.

While this pattern is a great way to design a safe hardware driver, it adds quite a bit more code. So you end up with the classic trade-off of quality vs. time. One important quality is guaranteed correct hardware configuration (if the driver is written correctly) which can play a major role in safety.

> When lives are on the line, the cost of laziness far outweighs the cost of effort.
> -- my good friend Adin

A partial implementation of the design pattern for the lis3dh can be found in the repo below.
 {{<github repo="SimonGorbot/lis3dh-driver" showThumbnail=false >}}
