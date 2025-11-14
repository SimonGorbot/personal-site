---
title: "Safe Sensor Drivers Using Rust's Type System"
date: 2025-08-05
type: 'project'

tags: ["Rust", "Embedded"]

summary: "Using the type-state design pattern with Rust's compiler to enforce proper hardware configuration."
description: "How can we use the type-state design pattern in Rust to help the compiler check hardware configuration."
weight: 1
---
## Background

During my previous internship at [Fourier](https://fourier.earth), I started my Embedded Rust development journey. I had previously written small amounts of Rust, but I would by no means say I knew the language at the time. One of Fourier's embedded systems engineers is a very passionate Embedded Rust developer. He is the one who introduced to the **type-state** pattern.

>The type-state pattern is an API design pattern that encodes information about an object’s run-time state in its compile-time type. In particular, >an API using the type-state pattern will have:
>
>
> 1. Operations on an object (such as methods or functions) that are only available when the object is in certain states,</li>
> 2. A way of encoding these states at the type level, such that attempts to use the operations in the wrong state fail to compile,
> 3. State transition operations (methods or functions) that change the type-level state of objects in addition to, or instead of, changing run-time dynamic state, such that the operations in the previous state are no longer possible.
>
>This is useful because:
>
>1. It moves certain types of errors from run-time to compile-time, giving programmers faster feedback.</li>
>2. It interacts nicely with IDEs, which can avoid suggesting operations that are illegal in a certain state.</li>
>3. It can eliminate run-time checks, making code faster/smaller.
>
>This great explanation is taken from [Cliffle's](https://cliffle.com/) blog post ["The Typestate Pattern in Rust"](https://cliffle.com/blog/rust-type-state/)

[Adin](https://adinack.dev/)<sub>(the aforementioned Embedded Rust co-worker)</sub>, showed me how we can leverage this design pattern that is so easy to implement in Rust to extend the capabilities of the Rust compiler to validate your hardware configurations.
My use of the type-state pattern in the crate is heavily inspired by work done by Adin in his pursuit of creating tools to generate better HALs. Read more about Adin's work [here](https://adinack.dev/blog/better-hals-first-look/).

## Groundwork

Let's start by laying out some key terms that we'll use throughout this example and how they are defined...

If we were to represent the hardware states within register fields as types in the Rust type system. The hardware states in the fields of registers are represented as type-states.

Type-states are marker types that directly correspond to hardware states.
Hardware states are exposed as values of register bit-fields. For any type-state there is going to be a physical value that will be in the physical register. That physical value is referred to as the raw value. For any field, all of the possible hardware states it may in-habit are represented as a variant of an enum named `Variant`. Type-states will implement a trait named `State` which contains a constant `VARIANT` of the type `Variant` and value corresponding to the raw value to achieve the represented hardware state.

We will use a trait named `Entitled` to express inter-bit-field relationships in the type system. This is the secret sauce that allows us coerce the compiler into checking our configurations.

Properties are values that are derived from multiple hardware-states of the sensor but aren't values that are directly written to registers.

In summary,
Type-states express hardware states.
The type relationships (as expressed by the `Entitled` trait) provide a proxy for the true hardware relationships.
The resulting structures facilitate correct hardware usage.

## An Example

### Scenario

Consider:
A simple sensor with a single configuration register. The register holds the configuration for the sensor's status, either enabled or disabled, it holds the selection of the sensors measurement range, and lastly it's power mode, either low power or normal power. This chip is very picky though, and if the sensor is disabled, it's range must be set to a specific value otherwise it exhibits undefined behavior. Another quirk of the sensor is that some measurement ranges are only available in specific power modes.

#### Register 1: Address 0x45

| Bit 7  | Bit 6  | Bit 5  | Bit 4   | Bit 3   | Bit 2   | Bit 1   | Bit 0   |
|--- |--- |--- |---- |---- |---- |---- |---- |
| -  | -  | -  | -  | Pm  | R1  | R0  | En  |

#### Register 1 Description

| Field         | Description                                                                                     |  
|   ---         | ---                                                                                             |
|   Pm          | Power mode select bit. Default value: 0<br>(0: Low power, 1: Normal power)                      |
|   R[1:0]      | Measurment range select. Default value: 00<br>(see Range Selection table for configurations)    |
|   En          | Status select bit. Default value: 0<br>(0: Disabled, 1: Enabled)                      |

#### Range Selection

| R1    | R0    | Selected Range                                                                                   | Power Mode Selection               |
| ---   |---    |---                                                                                               |---                                 |
|0      |0      |Range Disabled<br>*Must be set when sensor is disabled otherwise exhibits undefined behaviour.*      |Available in all power modes        |
|0      |1      |Range 1                                                                                           |Available in all power modes        |
|1      |0      |Range 2                                                                                           |Available in all power modes        |
|1      |1      |Range 3                                                                                           |Only Available in normal power mode |

#### Resolution Dependent On Power Mode

| Range                                   | Power Mode       | Resolution        |  
|   ---                                   |   ---            | ---               |
|   Range Disabled, Range 1, Range 2      |   Low Power      |   8 Bit           |
|   Range Disabled, Range 1, Range 2      |   Normal Power   |   12 Bit          |
|   Range 3                               |   Normal Power   |   16 Bit          |

*Recall Range 3 is only available in Normal Power mode.*

### Implementation

#### Our Type-States

We will begin our implementation of the pattern by defining our hardware-states as type-states. Because all of these hardware-states are confined to a single register, we will place them all within a single module. This module is also a convenient place to keep register specific values like it's hardware address. Each type-state is built in a module analogous to the register bit-field, which contains the previously mentioned `State` trait and `Variant` enum.

```rust
pub mod register_1 {
    pub const ADDR: u8 = 0x45;
    
    pub mod status {
        todo!()
    }

    pub mod range {
        todo!()
    }

    pub mod power_mode {
        todo!()
    }
}
```

Let's walk through the creation of our first type-state for the status select bit field.

```rust
pub mod register_1 {
    //...

    // Create the type-state in a mod named according to the bit-field.
    pub mod status {
        // We can store key field values here
        // For exampled, address and offset.
        pub const ADDR: u8 = super::ADDR;
        pub const OFFSET: u8 = 0;

        // We define our State trait that holds a const of type Variant.
        pub trait State {
            const VARIANT: Variant;
        }

        // We define our Variant enum with variants corresponding to the possible field values.
        // If we refer back to the register table we see that the possible field values are 0b0 for disabled, and 0b1 for enabled.
        #[repr(u8)]
        pub enum Variant {
            Disabled = 0b0,
            Enabled = 0b1,
        }

        // Now we create structs that will implement the State trait with their corresponding variant.
        pub struct Disabled;
        pub struct Enabled;
        impl State for Disabled {
            const VARIANT: Variant = Variant::Disabled;
        }
        impl State for Enabled {
            const VARIANT: Variant = Variant::Enabled;
        }
    }
    
    //...
}
```

We repeat this process for the other fields in the register and now we end up with the following:

 ```rust
 pub mod register_1 {
    pub const ADDR: u8 = 0x45;

    pub mod status {
        pub const ADDR: u8 = super::ADDR;
        pub const OFFSET: u8 = 0;

        pub trait State {
            const VARIANT: Variant;
        }

        #[repr(u8)]
        pub enum Variant {
            Disabled = 0b0,
            Enabled = 0b1,
        }

        pub struct Disabled;
        pub struct Enabled;
        impl State for Disabled {
            const VARIANT: Variant = Variant::Disabled;
        }
        impl State for Enabled {
            const VARIANT: Variant = Variant::Enabled;
        }
    }

    pub mod range {
        pub const ADDR: u8 = super::ADDR;
        pub const OFFSET: u8 = 1;
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
            const VARIANT: Variant = Variant::Range3;
        }
    }

    pub mod power_mode {
        pub const ADDR: u8 = super::ADDR;
        pub const OFFSET: u8 = 3;

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

    //...
}
```

Lastly we provide need to provide a way to access these type-states as they would appear in the register, as bits. To do so we add the straight forward associated function `render_as_bytes`.

```rust
pub mod register_1{
    //...

    pub fn render_as_bytes<Enable, Range, PowerMode>() -> u8
    where
        Enable: sensor_enable::State,
        Range: sensor_range::State + super::Entitled<Enable>,
        PowerMode: power_mode::State + super::Entitled<Range>,
    {
        ((Enable::VARIANT as u8) << sensor_enable::OFFSET)
            | ((Range::VARIANT as u8) << sensor_range::OFFSET)
            | ((PowerMode::VARIANT as u8) << power_mode::OFFSET)
    }
}
```

#### Expressing Entitlements

Now that we've created our type-states, we need to express their relationship with each other using the `Entitled` trait.
From the example, if `range` can only be set to one of the options: {`Range1`, `Range2`, and `Range3`}, if `status` is set to `Enabled`, then one could say that the Type-States `Range1`, `Range2`, and `Range3` of `range` are `Entitled` to the Type-State `Enabled` of `status`.
The mandatory hardware state of the sensor range bit-field when the sensor is disabled can be enforced by the compiler using Entitlements.
In code this would look like:

```rust
mod entitlement {
    pub trait Sealed<T> {}
}

pub trait Entitled<T>: entitlement::Sealed<T> {}

impl<T, U> Entitled<U> for T where T: entitlement::Sealed<U> {}

// The compiler enforces that sensor 1 can only be disabled if the sensor range is set to disabled.
impl entitlement::Sealed<status::Disabled> for range::RangeDisabled {}
// The rest of the ranges, naturally, require the sensor to be enabled.
impl entitlement::Sealed<status::Enabled> for range::Range1 {}
impl entitlement::Sealed<status::Enabled> for range::Range2 {}
impl entitlement::Sealed<status::Enabled> for range::Range3 {}
 ```

The other inter-bit-field relationship expressed in the scenario is between `power_mode` and `range`. The highest measurement range (`range::Range3`) isn’t available when it is configured in low power mode (`power_mode::LowPower`). Again, we can tell the compiler to enforce this hardware constraint using the `Entitled` trait.

```rust
// Sensor ranges 1 and 2 can be used in any power mode state.
impl<T: power_mode::State> entitlement::Sealed<sensor_range::Range1> for T {}
impl<T: power_mode::State> entitlement::Sealed<sensor_range::Range2> for T {}
// Sensor range 3 can exclusively be used in normal power mode.
impl entitlement::Sealed<sensor_range::Range3> for power_mode::NormalPower {}
```

Now we've expressed all our inter-bit-field relationships to the compiler, it will now help guide us in making valid configurations. We'll look at how these type-states are used in moment, just one more concept to introduce.

#### Properties

Properties are values that are derived from multiple hardware-states of the sensor but aren't values that are directly written to registers.
Continuing on from our scenario, we know the resolution is derived from the sensor measurement range and a new hardware state called `power_mode` that is defined below:

Then we can define the property like so following a very similar structure to the type-states we previously defined:

```rust
pub mod properties {
    pub mod resolution {
        use crate::register_1::{
            power_mode::{
                self,
                Variant::{LowPower, NormalPower},
            },
            range::{
                self,
                Variant::{Range1, Range2, Range3, RangeDisabled},
            },
        };
        #[derive(PartialEq)]
        #[repr(u8)]
        pub enum Variant {
            R8Bit = 8,
            R12Bit = 12,
            R16Bit = 16,
        }

        pub trait Property {
            const VARIANT: Variant;
        }

        pub struct Resolution<R, Pm>
        where
            R: range::State,
            Pm: power_mode::State,
        {
            _p: core::marker::PhantomData<(R, Pm)>,
        }

        #[rustfmt::skip]
        impl<R, Pm> Property for Resolution<R, Pm>
        where
            R: range::State,
            Pm: power_mode::State,
        {
            const VARIANT: Variant = {
                match (R::VARIANT, Pm::VARIANT) {
                    (RangeDisabled, LowPower) => Variant::R8Bit,
                    (RangeDisabled, NormalPower) => Variant::R12Bit,
                    (Range1, LowPower) => Variant::R8Bit,
                    (Range1, NormalPower) => Variant::R12Bit,
                    (Range2, LowPower) => Variant::R8Bit,
                    (Range2, NormalPower) => Variant::R12Bit,
                    (Range3, NormalPower) => Variant::R16Bit,
                    (Range3, LowPower) => unreachable!(),
                }
            };
        }
    }
}
```

#### Using The Type-States

There are lots of ways to write this last part of the API. Personally, I like the pattern of separate config and sensor structs, where the `Sensor` struct holds a valid config of type `Config`. So let's go ahead and make that...

We'll start by making new mod. For this example everything is written in a single file, but in full implementations normally this would be a new file.

```rust
pub mod config {
    use crate::{
        Entitled, properties,
        register_1::{self, power_mode, range, status},
    };

    todo!()
}
```

Now we'll create our config struct with generics for each bit-field that must implement their respective `State` and `Entitled` traits. We'll also add a byte representation of the config and a way to access it (with a single byte/register it looks a little silly, but normally there would be several).  

```rust
pub mod config {
   //...

    pub struct Config<Enable, Range, PowerMode>
    where
        Enable: sensor_enable::State,
        Range: sensor_range::State + Entitled<Enable>,
        PowerMode: power_mode::State + Entitled<Range>,
    {
        pub mode: Enable,
        pub range: Range,
        pub power_mode: PowerMode,
    }

    pub struct ConfigAsBytes {
        register_1: u8,
    }

    impl ConfigAsBytes {
        pub fn as_byte_buffer(&self) -> [u8; 1] {
            [self.register_1]
        }
    }

    //...
}
```

We'll also create a sealed convenience trait called `ValidConfig` that provides a way to pass **valid** generic configurations, rather than concrete configurations. If this trait didn't exist, one would need to specify the many generic parameters of config, but with the trait, `where T: ValidConfig` can be used.

```rust
pub mod config {
    //...

    mod sealed {
        pub trait Sealed {}
    }

    pub trait ValidConfig: sealed::Sealed {
        // Type-states corresponding to the sensor's Config and entitlement check.
        type Enable: register_1::status::State;
        type PowerMode: register_1::power_mode::State;
        type Range: register_1::range::State + Entitled<Self::Enable> + Entitled<Self::PowerMode>;

        // Properties corresponding to the sensor's Config.
        type Resolution: properties::resolution::Property;

        /// Render some [`ValidConfig`] to bytes.
        fn render_as_bytes() -> ConfigAsBytes;
    }

    impl<Enable, Range, PowerMode> sealed::Sealed for Config<Enable, Range, PowerMode>
    where
        Enable: status::State,
        Range: range::State + Entitled<Enable> + Entitled<PowerMode>,
        PowerMode: power_mode::State,
    {
    }

    impl<Enable, Range, PowerMode> ValidConfig for Config<Enable, Range, PowerMode>
    where
        Enable: status::State,
        Range: range::State + Entitled<Enable> + Entitled<PowerMode>,
        PowerMode: power_mode::State,
    {
        // Type-States
        type Enable = Enable;
        type Range = Range;
        type PowerMode = PowerMode;

        // Resulting Properties:
        type Resolution = properties::resolution::Resolution<Self::Range, Self::PowerMode>;

        fn render_as_bytes() -> ConfigAsBytes {
            ConfigAsBytes {
                register_1: register_1::render_as_bytes::<Enable, Range, PowerMode>(),
            }
        }
    }
}
```

Finally, we can create our sensor struct, again with a way to access it's config as bytes:

```rust
pub struct sensor<C: ValidConfig> {
    config: C,
}

impl<C: ValidConfig> sensor<C> {
    fn render_config_as_bytes(&self) -> config::ConfigAsBytes {
        C::render_as_bytes()
    }
}
```

### Results

Now let's see the fruits of our labour.

```rust
fn main() {
    let my_config = Config {
        mode: sensor_enable::SensorEnabled,
        range: sensor_range::Range3,
        power_mode: power_mode::NormalPower,
    };

    let my_sensor = sensor { config: my_config };
    let my_config_as_bytes: config::ConfigAsBytes = my_sensor.render_config_as_bytes();
    let config_to_write = my_config_as_bytes.as_byte_buffer();

    println!(
        "Bus write: {:#b} to {:#x}",
        config_to_write[0],
        register_1::ADDR
    );
}
```

Output:

```
Bus write: 0b1111 to 0x45
Sensor resolution: 16
```

And if we try with an invalid config where we try and use `Range3` in `LowPower` mode...

```rust
fn main() {
    let my_invalid_config = Config {
        mode: status::Enabled,
        range: range::Range3,
        power_mode: power_mode::LowPower,
    };

    //...
}
```

Output:

```
error[E0277]: the trait bound `Range3: Entitled<LowPower>` is not satisfied
   --> src/main.rs:276:16
    |
276 |         range: range::Range3,
    |                ^^^^^^^^^^^^^ the trait `entitlement::Sealed<LowPower>` is not implemented for `Range3`
    |
    = help: the following other types implement trait `entitlement::Sealed<T>`:
              `Range3` implements `entitlement::Sealed<Enabled>`
              `Range3` implements `entitlement::Sealed<NormalPower>`
note: required for `Range3` to implement `Entitled<LowPower>`
```

We've done it! The compiler is now able to help us enforce valid hardware configurations at compile time. Moreover, it's error message tells us how the sensor has been misconfigured: "required for `Range3` to implement `Entitled<LowPower>`". It's then clear to the programmer that `Range3` and `LowPower` in combination are not a valid configuration. The message also tells us "`Range3` implements `entitlement::Sealed<NormalPower>`" telling the programmer an alternative configuration that is valid! Wouldn't it be great if all HALs could do this!

## Closing Thoughts

I made use of the type-state API to make my driver for the [lis3dh accelerometer](https://www.st.com/en/mems-and-sensors/lis3dh.html). The lis3dh has many intertwined hardware configuration options which has caused many of the available crates to not expose these features. I can't know for certain why features were not exposed, but to me it seems that without the type-state pattern, there isn't a way to guarantee correct configuration of the inter-dependent features without performing several run-time checks. The type-state pattern solves this issue.

While this pattern is a great way to design a safe hardware driver, it adds a lot more code. A lot of the boiler plate can be reduced with macros which I made use of in the repo linked below if you're curious. As many people of all disciplines do, you end up with the classic trade-off of quality vs. time. One important quality is guaranteed correct hardware configuration (if the driver is written correctly) which can play a major role in safety.

> When lives are on the line, the cost of laziness far outweighs the cost of effort.<br>
> -- my good friend Adin

A Rust playground link of the example from this post for you to run and experiment with is available here: [Playground Link](https://play.rust-lang.org/?version=stable&mode=debug&edition=2024&gist=d1ec6f1b358ff4aae065043463301341)

A partial implementation of the design pattern for the lis3dh can be found in the repo below.
 {{<github repo="SimonGorbot/lis3dh-driver" showThumbnail=false >}}
