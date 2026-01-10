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

// ---- Gallery data (EDIT THIS) ----
// Put your images in /images and update this list.
// tag must match a filter: "projects" | "team" | "events" (or add your own)
const GALLERY = [
  { src: "/images/photo1.jpg", title: "Project Alpha", tag: "projects" },
  { src: "/images/photo2.jpg", title: "On-site Work", tag: "projects" },
  { src: "/images/photo3.jpg", title: "Team Moment", tag: "team" },
  { src: "/images/photo4.jpg", title: "Company Event", tag: "events" },
  { src: "/images/photo5.jpg", title: "Another Project", tag: "projects" },
  { src: "/images/photo6.jpg", title: "Behind the Scenes", tag: "team" },
];

const grid = document.getElementById("galleryGrid");
const chips = document.querySelectorAll(".chip");

let activeFilter = "all";
let filtered = [...GALLERY];

// ---- Render gallery ----
function render(items) {
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<div class="card" style="grid-column: span 12;">
      <h3 style="margin:0 0 .35rem;">No photos yet</h3>
      <p class="muted" style="margin:0;">Add images to <code>/images</code> and update <code>GALLERY</code> in <code>/assets/app.js</code>.</p>
    </div>`;
    return;
  }

  grid.innerHTML = items.map((p, idx) => `
    <article class="gallery-item" data-idx="${idx}" tabindex="0" role="button" aria-label="Open ${escapeHtml(p.title)}">
      <img src="${p.src}" alt="${escapeHtml(p.title)}" loading="lazy" />
      <div class="gi-cap">
        <div class="title">${escapeHtml(p.title)}</div>
        <div class="tag">${escapeHtml(p.tag)}</div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".gallery-item").forEach(el => {
    el.addEventListener("click", () => openLightbox(Number(el.dataset.idx)));
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") openLightbox(Number(el.dataset.idx));
    });
  });
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
    closeLightbox(); // if open, close on filter change
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

function openLightbox(index) {
  if (!lb || !lbImg || !lbCap) return;
  lbIndex = clamp(index, 0, filtered.length - 1);

  const photo = filtered[lbIndex];
  lbImg.src = photo.src;
  lbImg.alt = photo.title;
  lbCap.textContent = `${photo.title} • ${photo.tag}`;

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

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

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

// ---- Contact form: mailto fallback ----
const contactForm = document.getElementById("contactForm");
const contactHint = document.getElementById("contactHint");
const emailLink = document.getElementById("emailLink");

const CONTACT_EMAIL = "email@company.com"; // change me
emailLink && (emailLink.textContent = CONTACT_EMAIL);
emailLink && (emailLink.href = `mailto:${CONTACT_EMAIL}`);

contactForm?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = new FormData(contactForm);
  const name = form.get("name");
  const email = form.get("email");
  const message = form.get("message");

  const subject = encodeURIComponent(`Website contact from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);

  const href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  window.location.href = href;

  if (contactHint) {
    contactHint.textContent = "Opening your email client… If nothing happens, email us directly using the address on the right.";
  }
});

// ---- Footer year ----
document.getElementById("year").textContent = String(new Date().getFullYear());

// ---- Initial render ----
render(filtered);
