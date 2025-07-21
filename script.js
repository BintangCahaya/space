// Theme Toggle
const toggleBtn = document.getElementById("toggleMode");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("light-mode");
});

// Click Sound
const clickSound = document.getElementById("clickSound");
document.querySelectorAll(".btn-sound").forEach(button => {
  button.addEventListener("click", () => {
    clickSound.currentTime = 0;
    clickSound.play().catch(() => {});
  });
});

// Background Music
const bgMusic = document.getElementById("bgMusic");
const toggleMusic = document.getElementById("toggleMusic");

toggleMusic.addEventListener("click", () => {
  if (bgMusic.paused) {
    bgMusic.play();
    toggleMusic.textContent = "🔊 Music On/Off";
  } else {
    bgMusic.pause();
    toggleMusic.textContent = "🔇 Music On/Off";
  }
});

// STARFIELD BACKGROUND with shooting stars and mouse parallax
const canvas = document.getElementById("stars");
const ctx = canvas.getContext("2d");

let stars = [];
let shootingStars = [];
const numStars = 150;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createStars() {
  stars = Array.from({ length: numStars }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.3,
    dx: 0
  }));
}

function createShootingStar() {
  shootingStars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height / 2,
    length: Math.random() * 80 + 20,
    speed: Math.random() * 6 + 6,
    angle: Math.PI / 4
  });
}

function drawStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  stars.forEach(star => {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
    ctx.fill();
    star.y += star.speed;
    star.x += star.dx;
    if (star.y > canvas.height) star.y = 0;
    if (star.x > canvas.width) star.x = 0;
    if (star.x < 0) star.x = canvas.width;
  });

  ctx.strokeStyle = "#fff";
  shootingStars.forEach((star, index) => {
    const endX = star.x + star.length * Math.cos(star.angle);
    const endY = star.y + star.length * Math.sin(star.angle);
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    star.x += star.speed * Math.cos(star.angle);
    star.y += star.speed * Math.sin(star.angle);
    if (star.x > canvas.width || star.y > canvas.height) {
      shootingStars.splice(index, 1);
    }
  });

  requestAnimationFrame(drawStars);
}

window.addEventListener("mousemove", (e) => {
  const centerX = canvas.width / 2;
  const deltaX = (e.clientX - centerX) / centerX;
  stars.forEach(star => {
    star.dx = deltaX * 0.3;
  });
});

setInterval(createShootingStar, 3000);

createStars();
drawStars();

// 🐦 Bird sound logic
const birdSound = document.getElementById("birdSound");

function updateAmbientSounds() {
  if (document.body.classList.contains("light-mode")) {
    birdSound.play().catch(() => {});
  } else {
    birdSound.pause();
    birdSound.currentTime = 0;
  }
}

toggleBtn.addEventListener("click", updateAmbientSounds);
window.addEventListener("DOMContentLoaded", updateAmbientSounds);

// 🌌 Scroll-based parallax effect
const layers = document.querySelectorAll('.parallax-layer');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  layers.forEach((layer, i) => {
    const depth = (i + 1) * 0.3;
    layer.style.transform = `translateY(${scrollY * depth}px)`;
  });
});

// 🌌 NASA Astronomy Picture of the Day (APOD)
fetch("https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY")
  .then(response => response.json())
  .then(data => {
    const apodDiv = document.getElementById("apodContent");
    apodDiv.innerHTML = `
      <h3>${data.title}</h3>
      <img src="${data.url}" alt="${data.title}" style="max-width:100%; border-radius:10px;" />
      <p>${data.explanation}</p>
      <small>${data.date}</small>
    `;
  })
  .catch(err => {
    document.getElementById("apodContent").innerHTML = `<p>Unable to load data from NASA.</p>`;
    console.error("APOD Error:", err);
  });

// 🔴 Mars Weather using public API
fetch("https://api.maas2.apollorion.com/")
  .then(response => response.json())
  .then(data => {
    const marsWeatherDiv = document.getElementById("marsWeatherContent");
    marsWeatherDiv.innerHTML = `
      <ul>
        <li><strong>Sol:</strong> ${data.sol}</li>
        <li><strong>Season:</strong> ${data.season}</li>
        <li><strong>Min Temp:</strong> ${data.min_temp}&deg;C</li>
        <li><strong>Max Temp:</strong> ${data.max_temp}&deg;C</li>
        <li><strong>Pressure:</strong> ${data.pressure} Pa</li>
        <li><strong>Atmosphere:</strong> ${data.atmo_opacity}</li>
      </ul>
      <small>Last updated: ${data.last_updated}</small>
    `;
  })
  .catch(error => {
    const marsWeatherDiv = document.getElementById("marsWeatherContent");
    marsWeatherDiv.innerHTML = "<p>Failed to load Mars weather data.</p>";
    console.error("Mars Weather API error:", error);
  });

// 🛰️ ISS Tracker with Leaflet.js
const issMap = L.map('issMap').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(issMap);

const issIcon = L.icon({
  iconUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/International_Space_Station.svg',
  iconSize: [50, 32],
  iconAnchor: [25, 16]
});

const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(issMap);
let firstLoad = true;

async function updateISS() {
  const res = await fetch('https://api.wheretheiss.at/v1/satellites/25544');
  const data = await res.json();
  const { latitude, longitude } = data;

  issMarker.setLatLng([latitude, longitude]);

  if (firstLoad) {
    issMap.setView([latitude, longitude], 3);
    firstLoad = false;
  }
}

setInterval(updateISS, 5000); // update every 5 seconds
updateISS(); // initial load
