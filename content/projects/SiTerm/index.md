---
title: "SiTerm: Embedded Development Tool"
date: 2025-10-10
type: 'project'

tags: ["Rust", "Embedded", "WIP"]

summary: "A TUI+Adapter that allows you to interface your laptop via USB to downstream systems and transfer serial messages using I2C, SPI, and UART. "
description: "A TUI+Adapter that allows you to interface your laptop via USB to downstream systems and transfer serial messages using I2C, SPI, and UART. "
weight: 2
---

This is still very much so a work in progress. I'm really trying to find time to work on it between classes and capstone. Never the less, here's some info about the project so far:

- Everything is programmed in Rust.
- I'm using [ratatui.rs](https://ratatui.rs/) to cook up my tui.
- The MCU I'm using as the adapter is the [RP2040-Zero](https://www.waveshare.com/wiki/RP2040-Zero) board from WaveShare
  - I picked this board specifically because it's tiny, has USB-C, all the peripherals necessary, and the potential to do something cool with [PIO](https://www.raspberrypi.com/news/what-is-pio/).
  - Once all the code is complete I might make a shield for even easier connections to downstream embedded systems.
- I'm using the [Embassy framework](https://embassy.dev/) for my firmware  
- The name of the project comes from an abbreviated form of **S**erial **I**nterface **Term**inal. It's also the first two letters of my name **Si**mon **Term**inal.
- There's a lot of unused code in the project currently because I started from a template. I'm in the process of trimming all of it out.

## Command List

All commands follow the general format: `protocol action payload`. Payloads are action specific depending on the command you are writting.

### I2C

#### Leader

##### Single Byte Read

 Protocol  | Action  | Payload                            | Example                        | Complete |
---------- |-------- |------------------------------------|--------------------------------|----------|
i2c        |r        |device_address register_address 1   |`i2c r 0x1A 0x0F 1`             | ✅       |

##### Single Byte Write

 Protocol  | Action  | Payload                                         | Example                         | Complete |
---------- |-------- |-------------------------------------------------|---------------------------------|----------|
i2c        |w        |device_address register_address value_to_write   |`i2c r 0x1A 0x0F 0xFF`           | 🚧       |

##### Batch Read

 Protocol | Action  | Payload                                          | Example              | Complete |
----------|---------|--------------------------------------------------|----------------------|----------|
i2c       |r        |device_address starting_register_address num_reads|`i2c r 0x1A 0x0F 3`   |🚧        |

##### Batch Write

 Protocol | Action  | Payload                                                                                | Example                           | Complete |
----------|---------|----------------------------------------------------------------------------------------|-----------------------------------|----------|
i2c       |r        |device_address starting_register_address value_to_write_1 ... value_to_write_n|`i2c r 0x1A 0x0F 0x0A 0x0B 0x0C`   |🚧        |

#### Follower

##### Listen

*coming soon*

### SPI

#### Leader

##### Single Byte Read

*coming soon*

##### Single Byte Write

*coming soon*

##### Batch Read

*coming soon*

##### Batch Write

*coming soon*

### UART

#### Send String

*coming soon*

#### Send Bytes

*coming soon*

#### Read Number Bytes

*coming soon*

#### Read Until Byte/Bytes

*coming soon*

### PWM

#### Set Duty Cycle

*coming soon*

 {{<github repo="SimonGorbot/SiTerm" showThumbnail=false >}}
