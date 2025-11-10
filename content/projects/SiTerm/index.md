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

 {{<github repo="SimonGorbot/SiTerm" showThumbnail=false >}}
