---
title: "Anti-Anti Masker Mask [Hackathon: Winner]"
date: 2019-03-05
type: 'project'

tags: ["Hackathon", "C++", "OpenCV", "3D Printing"]

summary: "A wearable system that detects nearby unmasked individuals and automatically launches soft darts to enforce social distancing. Built in 24 hours during covid."
description: "A wearable system that detects nearby unmasked individuals and automatically launches soft darts to enforce social distancing. Built in 24 hours using OpenCV vision, a TOF sensor, and a custom 3D-printed launcher."
---
## Submission Video
{{< youtubeLite id="deU-cz6A0MM" label="Blowfish-tools demo" >}}

## Background
Developed at MakeUofT 2022 by myself and 3 other group members, the “Anti-Anti Masker Mask” was a light-hearted yet technically complex hackathon project inspired by pandemic-era distancing rules. The system combined computer vision, embedded control, and custom mechanical design to autonomously respond when an unmasked person approached within two meters.
![Gif of Mask and Dart Launcher](aamm.gif)

## System Overview
The prototype consisted of three main subsystems: mechanical, sensing and vision, and embedded control.

### 1. Mechanical Design
The dart launcher, loading system, and shoulder frame were custom-modeled in SolidWorks and fabricated with FDM 3D printing.
Because we had no fasteners on hand, we used dovetail joints inspired by woodworking to make the assembly fully snap-fit.

The launcher used two brushless drone motors as flywheels, powered by a small Li-Po battery. Darts were fed into the chamber via a rack-and-pinion system driven by a servo motor. Everything was orchestrated by an Arduino Nano, which received firing commands from a laptop.

![CAD of dart launcher.](cad.png)

### 2. Sensing and Vision
A Time-of-Flight (TOF) distance sensor continuously measured the distance to the nearest person.
A laptop ran an OpenCV-based vision pipeline that accessed a live camera feed, performed face detection, and identified whether the detected face was masked.

If an unmasked person entered a configurable “danger zone” (roughly 0.8 m – 1.5 m), a command was sent via UART to the Arduino to activate the launcher.

### Code
The Arduino handled motor timing, servo control, and safety interlocks.
All communication between the laptop and launcher was done over serial, using a simple message protocol for distance and trigger events.
We prioritized responsiveness — latency from detection to launch averaged under 200 ms in our demo tests.

## Challenges and Adaptation
Our initial plan was to run the entire system TOF sensing, computer vision, and motor control on a Raspberry Pi for a fully self-contained, battery-powered build.
Reality struck when we discovered the Pi Zero couldn’t run OpenCV in real-time. It started as a miscommunication as we borrowed what we thought was going to be a Raspberry Pi 3 from a friend, but it ended up being a Pi Zero.

With only a few hours left, we refactored the architecture into a split system: the laptop handled sensing and vision, while the Arduino managed actuation. This quick pivot allowed us to finish with a fully functional (and crowd-pleasing) prototype by demo time.

## More
For more info on the challenges we faced, lessons we learned, and future improvements please check out the AAMM DevPost link below :
https://devpost.com/software/anti-anti-masker-mask