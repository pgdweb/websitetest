// ===============================
// PGD Photography - Site Script
// ===============================

// ---- Mobile nav ----
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

menuBtn?.addEventListener("click", () => {
  const expanded = menuBtn.getAttribute("aria-expanded") === "true";
  menuBtn.setAttribute("aria-expanded", String(!expanded));
  mobileNav.hidden = expanded;
});

mobileNav?.querySelectorAll("a").forEach(a => {
  a.addEventListener("click", () => {
    menuBtn.setAttribute("aria-expanded", "false");
    mobileNav.hidden = true;
  });
});

// ---- Customize these ----
const CONTACT_EMAIL = "hello@pgdphotography.com"; // change if needed
const INSTAGRAM_URL = "#"; // e.g. "https://instagram.com/pgdphotography"
const LINKEDIN_URL = "#";  // optional

// Optional: set these text lines without editing HTML
const LOCATION_LINE = "Your City, State";
const HOURS_LINE = "Mon–Fri • 9–5";

// ---- Gallery data ----
// Add images to /images and update this list.
// tag must match one of: portraits | events | brand | couples
const GALLERY = [
  { src: "/images/p1.jpg", title: "Studio Portrait", tag: "portraits" },
  { src: "/images/p2.jpg", title: "Natural Light Session", tag: "portraits" },
  { src: "/images/p3.jpg", title: "Private Event Coverage", tag: "events" },
  { src: "/images/p4.jpg", title: "Brand Campaign", tag: "brand" },
  { src: "/images/p5.jpg", title: "Couples Session", tag: "couples" },
  { src: "/images/p6.jpg", title: "On-Location Portrait", tag: "portraits" },
];

const grid = document.getElementById("galleryGrid");
const chips = document.querySelectorAll(".chip");

// Contact UI
const emailLink = document.getElementById("emailLink");
const instagramLink = document.getElementById("instagramLink");
const linkedinLink = document.getElementById("linkedinLink");
const locationLine = document.getElementById("locationLine");
const hoursLine = document.getElementById("hoursLine");

if (emailLink) {
  emailLink.textContent = CONTACT_EMAIL;
  emailLink.href = `mailto:${CONTACT_EMAIL}`;
}
if (instagramLink) instagramLink.href = INSTAGRAM_URL;
if (linkedinLink) linkedinLink.href = LINKEDIN_URL;
if (locationLine) locationLine.textContent = LOCATION_LINE;
if (hoursLine) hoursLine.textContent = HOURS_LINE;

// ---- Filtering state ----
let activeFilter = "all";
let filtered = [...GALLERY];

// ---- Render gallery ----
function render(items) {
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `
      <div class="card" style="grid-column: span 12;">
        <h3 style="margin:0 0 .35rem;">No photos yet</h3>
        <p class="muted" style="margin:0;">
          Add images to <code>/images</code> and update <code>GALLERY</code> in <code>/assets/app.js</code>.
        </p>
      </div>`;
    return;
  }

  grid.innerHTML = items.map((p, idx) => `
    <article class="gallery-item" data-idx="${idx}" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.title)}">
      <img src="${p.src}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <div class="gi-cap">
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="tag">${escapeHtml(prettyTag(p.tag))}</div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".gallery-item").forEach(el => {
    el.addEventListener("click", () => openLightbox(Number(el.dataset.idx)));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openLightbox(Number(el.dataset.idx));
      }
    });
  });
}

function prettyTag(tag) {
  const map = {
    portraits: "Portraits",
    events: "Events",
    brand: "Brand",
    couples: "Couples",
  };
  return map[tag] || tag;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[m]));
}

// ---- Filtering ----
chips.forEach(btn => {
  btn.addEventListener("click", () => {
    chips.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    chips.forEach(b => b.setAttribute("aria-selected", b === btn ? "true" : "false"));

    activeFilter = btn.dataset.filter;
    filtered = activeFilter === "all" ? [...GALLERY] : GALLERY.filter(p => p.tag === activeFilter);
    render(filtered);
    closeLightbox();
  });
});

// ---- Lightbox ----
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
const lbClose = document.getElementById("lbClose");
const lbPrev = document.getElementById("lbPrev");
const lbNext = document.getElementById("lbNext");

let lbIndex = 0;

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

function openLightbox(index) {
  if (!lb || !lbImg || !lbCap) return;
  lbIndex = clamp(index, 0, filtered.length - 1);

  const photo = filtered[lbIndex];
  lbImg.src = photo.src;
  lbImg.alt = photo.title;
  lbCap.textContent = `${photo.title} • ${prettyTag(photo.tag)}`;

  lb.classList.add("open");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  if (!lb) return;
  lb.classList.remove("open");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function prev() { openLightbox(lbIndex - 1); }
function next() { openLightbox(lbIndex + 1); }

lbClose?.addEventListener("click", closeLightbox);
lbPrev?.addEventListener("click", prev);
lbNext?.addEventListener("click", next);

lb?.addEventListener("click", (e) => {
  if (e.target === lb) closeLightbox();
});

window.addEventListener("keydown", (e) => {
  if (!lb || !lb.classList.contains("open")) return;
  if (e.key === "Escape") closeLightbox();
  if (e.key === "ArrowLeft") prev();
  if (e.key === "ArrowRight") next();
});

// ---- Contact form (mailto fallback) ----
const contactForm = document.getElementById("contactForm");
const contactHint = document.getElementById("contactHint");

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(contactForm);

  const name = form.get("name");
  const email = form.get("email");
  const type = form.get("type");
  const message = form.get("message");

  const subject = encodeURIComponent(`Booking request (${type}) — ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\nSession Type: ${type}\n\nMessage:\n${message}\n`
  );

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;

  if (contactHint) {
    contactHint.textContent = "Opening your email client… If nothing happens, email us directly using the address on the right.";
  }
});

// ---- Footer year ----
document.getElementById("year").textContent = String(new Date().getFullYear());

// ---- Initial render ----
render(filtered);
