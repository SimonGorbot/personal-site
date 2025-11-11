---
title: "BananaHand: Open Source Anthropomorphic Robotic Hand"
date: 2025-08-05
type: 'project'

tags: ["Rust", "KiCAD", "Robotics", "WIP"]

weight: 5

summary: "An open-source humanoid hand that combines proportional design, dexterity, tactile sensing, and affordability."
description: "An open-source humanoid hand that combines proportional design, dexterity, tactile sensing, and affordability."
---

## Background

In our final year of engineering at the University of Waterloo, students form groups to create a project over the span of 8-months that is meant to apply the knowledge and skills learned in the classroom and on co-op work terms. Since my four group mates and I have benefited so much from the open-source hardware community, we decided we want to contribute to the space. We’re building a fully open-source 16DOF/8DOA humanoid hand with integrated force sensing that will help give research labs and smaller robotics companies access to a high quality hardware platform to interact with the world built for human hands. We’ve dubbed the project “Banana Hand”. Why? Because we all like bananas.

This project is still very much so a work in progress and will be for quite a while. I'll be updating progress in a weekly dev log here if you're interested: *[coming soon]()*

## My Contribution To The Team

I will be primarily focused on writing the firmware for the hand (in Rust) as well as the design of all electrical sub-systems.

## Problem Statement

Grasping remains one of the hardest unsolved problems in robotics, as it underpins a robot’s ability to interact with the human world. Yet researchers lack access to a humanoid hand that is affordable, proportional, robust, and well-documented.

Through conversations with many different robotics researchers at multiple universities, we learned that most researchers are interested in human-like robotic grasping, however, almost all turn away from solving the problem because of the high barrier to entry.  On one end, the most accurate commercial robot hand solutions with the appropriate dexterity and force sensing are massively out of their price range. On the other end, the more affordable options are fragile and often create more headache than contribution to their research.  Across this landscape, no option provides the right combination of accessibility, proportional design, sensing capability, and usability.  This leads to many researchers settling for basic off-the-shelf two-fingered or 3-fingered grippers, which are extremely limited in human-like object manipulation, force sensing feedback, and grasping complex objects such as power tools and cooking utensils.  Without a practical platform to explore dexterous robotic manipulation, academic labs, startups, and industry researchers are forced to abandon the problem — a major bottleneck for progress in humanoid robotics and embodied AI.

Meanwhile, industry leaders are investing heavily in humanoid robotics — for example, Figure AI has raised over $1 billion at a $39 billion valuation to accelerate development of general-purpose humanoids. This underscores the importance and urgency of the field, yet outside of these highly funded efforts, academic labs and startups are left without practical tools for studying dexterous manipulation.

If developments in the robotics scene are moving towards integrating robots into everyday life to save people time and energy, then accessible human-like multipurpose grasping is a problem that absolutely must be solved.

## Our Solution

Our team is developing an open-source humanoid hand that combines proportional design, dexterity, tactile sensing, and affordability — attributes that existing solutions fail to deliver in a single platform. The hand is designed to perform the five fundamental human grips (pinch, tripod, hook, cylindrical, spherical), making it a versatile tool for studying real-world manipulation.

The hand will balance complexity and accessibility with 16 degrees of freedom and 8 actuated joints, enabling human-like motion without excessive size or cost.  This includes a dexterous thumb, a dexterous index finger, and powerful grip from the latter 3 fingers, to maximize versatility and strength in a diverse range of applications. Integrated force sensing in the fingertips and palm will provide both touch detection and localized force feedback, allowing researchers to achieve more precise, closed-loop control during grasping tasks.

All design files — including CAD, firmware, ROS2 integration, and testing protocols — will be released under an open-source license, ensuring that researchers can both use and extend the platform. By targeting a cost of $2k–3k and leveraging accessible fabrication methods, the project lowers the barrier to entry for labs, startups, and industry researchers who want to explore dexterous robotic manipulation.

## How does our solution improve on existing technologies or fill a void in the marketplace?

Existing humanoid hands each succeed in one or two areas but fall short in others. High-end options like the Shadow Hand achieve excellent dexterity but cost nearly $100,000 and require large forearms, making them inaccessible to most researchers. Mid-tier open-source solutions such as the ORCA Hand ($8,000) provide dexterity but remain bulky and lack tactile sensing. The Leap Hand is more affordable but compromises proportionality and omits sensing, while ultra-low-cost options like the Amazing Hand ($250) are mechanically simple and unsuitable for serious research due to limited functionality and robustness.

Our solution fills this gap by combining **four attributes that have never been offered together**:

- **Affordability**: A target cost of $2–3k, an order of magnitude less than high-end systems.
- **Proportionality**: Human-like kinematics that make interaction with everyday objects realistic.
- **Dexterity**: Support for the five fundamental grips with 16 DoF / 8 actuated joints.
- **Tactile Sensing**: Force feedback in both the fingertips and palm for closed-loop control.

By uniting these features in an open-source platform, our hand becomes the first practical, community-driven research tool for humanoid grasping. It lowers the barrier to entry for labs, startups, and industry researchers, filling a critical void in the marketplace between prohibitively expensive commercial products and under-powered hobbyist models.
