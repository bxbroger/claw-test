const canvas = document.getElementById("ambient-canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.getElementById("scroll-progress-bar");

const blobs = [
  { x: 0.22, y: 0.2, r: 180, dx: 0.00018, dy: 0.00013, color: "rgba(126,231,255,0.18)" },
  { x: 0.75, y: 0.34, r: 220, dx: -0.00011, dy: 0.00015, color: "rgba(255,212,107,0.13)" },
  { x: 0.52, y: 0.75, r: 250, dx: 0.00009, dy: -0.00012, color: "rgba(128,163,255,0.15)" }
];

let width = 0;
let height = 0;
let rafId = 0;

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.floor(width * window.devicePixelRatio);
  canvas.height = Math.floor(height * window.devicePixelRatio);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

function drawAmbient() {
  ctx.clearRect(0, 0, width, height);

  blobs.forEach((b) => {
    b.x += b.dx;
    b.y += b.dy;

    if (b.x < 0.05 || b.x > 0.95) b.dx *= -1;
    if (b.y < 0.08 || b.y > 0.92) b.dy *= -1;

    const gx = b.x * width;
    const gy = b.y * height;

    const grad = ctx.createRadialGradient(gx, gy, 10, gx, gy, b.r);
    grad.addColorStop(0, b.color);
    grad.addColorStop(1, "rgba(0,0,0,0)");

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  rafId = requestAnimationFrame(drawAmbient);
}

function handleScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressBar.style.width = `${ratio}%`;

  const items = document.querySelectorAll("[data-parallax]");
  items.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.05);
    const y = window.scrollY * speed;
    item.style.transform = `translate3d(0, ${y}px, 0)`;
  });
}

function setupReveal() {
  const nodes = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  nodes.forEach((node) => observer.observe(node));
}

function setupMagnetic() {
  const magnetics = document.querySelectorAll(".magnetic");

  magnetics.forEach((el) => {
    el.addEventListener("mousemove", (event) => {
      const rect = el.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate(${offsetX * 0.13}px, ${offsetY * 0.13}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate(0, 0)";
    });
  });
}

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", handleScroll, { passive: true });

resizeCanvas();
drawAmbient();
setupReveal();
setupMagnetic();
handleScroll();

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(rafId);
});
