document.addEventListener("DOMContentLoaded", () => {
  const images = [
    "static/images/portraits/01_yosemite.jpg",
    "static/images/portraits/01_yosemite.jpg",
    "static/images/portraits/01_yosemite.jpg",
  ];

  const randomIndex = Math.floor(Math.random() * images.length);
  document.getElementById("random-about-image").src = images[randomIndex];
});
