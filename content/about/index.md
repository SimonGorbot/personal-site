---
title: "About Me"
description: "Learn a little bit more about who I am."
---

Hi I'm Simon, a senior studying Mechatronics Engineering at the University of Waterloo.

I love working with and designing embedded systems, both the firmware and hardware.  

In my free time I like to play volleyball, climb, drink a good coffee, spend time with my cat, and enjoy the great outdoors!

<img id="random-about-image" alt="About Me" />

*refresh for a new random portrait*

<!-- Random Portrait Script -->
<script>
  // List of images with weights
  const images = [
    { src: "/about/gallery_me/01_yosemite.jpg", weight: 4 },
    { src: "/about/gallery_me/02_zion.jpeg", weight: 2 },
    { src: "/about/gallery_me/03_climb.jpeg", weight: 2 },
    { src: "/about/gallery_me/04_iceland.jpeg", weight: 1 },
    { src: "/about/gallery_me/05_wheat.jpeg", weight: 2 },
    { src: "/about/gallery_me/06_beach.jpeg", weight: 2 },
    { src: "/about/gallery_me/07_redlight.jpeg", weight: 2 },
    { src: "/about/gallery_me/08_hammock.jpg", weight: 2 },
    { src: "/about/gallery_me/09_yosem_selfie.jpg", weight: 2 },
  ];

  // Helper: weighted random choice
  function weightedChoice(items) {
    const total = items.reduce((sum, item) => sum + item.weight, 0);
    let r = Math.random() * total;
    for (let item of items) {
      if (r < item.weight) return item;
      r -= item.weight;
    }
  }

  // Load last image from previous refresh
  const lastImg = sessionStorage.getItem("lastAboutImage");

  // Filter out last image (so we don't repeat)
  const available = images.filter(img => img.src !== lastImg);

  // Pick a new one
  const choice = weightedChoice(available);

  // Apply it
  const img = document.getElementById("random-about-image");
  img.src = choice.src;

  // Save this choice for next refresh
  sessionStorage.setItem("lastAboutImage", choice.src);
</script>
