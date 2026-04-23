const canvas = document.getElementById("ambient-canvas");
const ctx = canvas.getContext("2d");
const progressBar = document.getElementById("scroll-progress-bar");

const blobs = [
  { x: 0.22, y: 0.2, r: 180, dx: 0.00018, dy: 0.00013, color: "rgba(126,231,255,0.18)" },
  { x: 0.75, y: 0.34, r: 220, dx: -0.00011, dy: 0.00015, color: "rgba(255,212,107,0.13)" },
  { x: 0.52, y: 0.75, r: 250, dx: 0.00009, dy: -0.00012, color: "rgba(128,163,255,0.15)" }
];

const PAGE_TRANSITION_MS = 700; // matches CSS .page-transition transition: 0.7s

let width = 0;
let height = 0;
let rafId = 0;
let cursorRafId = 0;
let mouseNX = 0.5;
let mouseNY = 0.5;

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

    // Subtle mouse influence
    b.x += (mouseNX - b.x) * 0.00025;
    b.y += (mouseNY - b.y) * 0.00025;

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

/* ── Unified transform state (parallax + tilt) ── */
const transformState = new WeakMap();

function getTransformState(el) {
  if (!transformState.has(el)) {
    transformState.set(el, { parallaxY: 0, tiltX: 0, tiltY: 0 });
  }
  return transformState.get(el);
}

function applyTransform(el) {
  const s = getTransformState(el);
  if (s.tiltX !== 0 || s.tiltY !== 0) {
    el.style.transform = `perspective(900px) rotateX(${s.tiltX}deg) rotateY(${s.tiltY}deg) translate3d(0, ${s.parallaxY}px, 0)`;
  } else {
    el.style.transform = `translate3d(0, ${s.parallaxY}px, 0)`;
  }
}

function handleScroll() {
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const ratio = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  progressBar.style.width = `${ratio}%`;

  const items = document.querySelectorAll("[data-parallax]");
  items.forEach((item) => {
    const speed = Number(item.dataset.parallax || 0.05);
    const y = window.scrollY * speed;
    const s = getTransformState(item);
    s.parallaxY = y;
    applyTransform(item);
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

/* ── Custom Cursor ── */
function setupCursor() {
  const dot = document.querySelector(".cursor-dot");
  const ring = document.querySelector(".cursor-ring");
  if (!dot || !ring) return;
  if (!window.matchMedia("(pointer: fine)").matches) return;

  let mx = -200, my = -200;
  let rx = -200, ry = -200;
  let cursorVisible = false;

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    if (!cursorVisible) {
      cursorVisible = true;
      dot.style.opacity = "1";
      ring.style.opacity = "1";
    }
  });

  document.addEventListener("mouseleave", () => {
    cursorVisible = false;
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });

  document.addEventListener("mousedown", () => ring.classList.add("clicking"));
  document.addEventListener("mouseup", () => ring.classList.remove("clicking"));

  document.querySelectorAll("a, button, .project-card, .project-row").forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("hovered"));
    el.addEventListener("mouseleave", () => ring.classList.remove("hovered"));
  });

  (function animateCursor() {
    dot.style.left = `${mx}px`;
    dot.style.top = `${my}px`;

    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = `${rx}px`;
    ring.style.top = `${ry}px`;

    cursorRafId = requestAnimationFrame(animateCursor);
  })();
}

/* ── Split-text Word Reveal ── */
function setupTextSplit() {
  const headings = document.querySelectorAll(
    ".hero h1, .intro h2, .cta h2, .section-head h3, .hero.compact h1, .row-content h2"
  );

  headings.forEach((heading) => {
    const rawText = heading.textContent.trim();
    const words = rawText.split(/\s+/);
    heading.textContent = "";
    words.forEach((word, i) => {
      if (i > 0) heading.appendChild(document.createTextNode(" "));
      const wrap = document.createElement("span");
      wrap.className = "word-wrap";
      const inner = document.createElement("span");
      inner.className = "word";
      inner.textContent = word;
      wrap.appendChild(inner);
      heading.appendChild(wrap);
    });
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const words = entry.target.querySelectorAll(".word");
          words.forEach((word, i) => {
            setTimeout(() => word.classList.add("visible"), i * 45);
          });
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
  );

  headings.forEach((h) => observer.observe(h));
}

/* ── 3D Card Tilt ── */
function setupCardTilt() {
  const cards = document.querySelectorAll(".project-card, .project-row");

  cards.forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const tiltX = ((y - cy) / cy) * -6;
      const tiltY = ((x - cx) / cx) * 6;
      const s = getTransformState(card);
      s.tiltX = tiltX;
      s.tiltY = tiltY;
      applyTransform(card);
    });

    card.addEventListener("mouseleave", () => {
      const s = getTransformState(card);
      s.tiltX = 0;
      s.tiltY = 0;
      applyTransform(card);
    });
  });
}

/* ── Page Transition ── */
function setupPageTransition() {
  const overlay = document.querySelector(".page-transition");
  if (!overlay) return;

  // Slide up on load to reveal the page
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      overlay.classList.add("revealed");
    });
  });

  document.querySelectorAll("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
    if (href.startsWith("http") && !href.includes(window.location.hostname)) return;

    link.addEventListener("click", (e) => {
      e.preventDefault();
      const target = link.href;
      overlay.classList.remove("revealed");
      overlay.classList.add("covering");
      setTimeout(() => {
        window.location.href = target;
      }, PAGE_TRANSITION_MS + 20);
    });
  });
}

/* ── Header Scroll Behavior ── */
function setupHeader() {
  const header = document.getElementById("site-header");
  if (!header) return;
  let lastY = 0;

  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      if (y > 80) {
        header.classList.add("scrolled");
      } else {
        header.classList.remove("scrolled");
      }
      if (y > lastY + 8 && y > 160) {
        header.classList.add("hidden");
      } else if (y < lastY - 8 || y < 80) {
        header.classList.remove("hidden");
      }
      lastY = y;
    },
    { passive: true }
  );
}

/* ── Mouse tracking for ambient canvas ── */
document.addEventListener("mousemove", (e) => {
  mouseNX = e.clientX / window.innerWidth;
  mouseNY = e.clientY / window.innerHeight;
});

window.addEventListener("resize", resizeCanvas);
window.addEventListener("scroll", handleScroll, { passive: true });

resizeCanvas();
drawAmbient();
setupReveal();
setupMagnetic();
setupCursor();
setupTextSplit();
setupCardTilt();
setupPageTransition();
setupHeader();
handleScroll();

window.addEventListener("beforeunload", () => {
  cancelAnimationFrame(rafId);
  cancelAnimationFrame(cursorRafId);
});
