/* HockeyNow site — small, dependency-free.
 *
 * ┌─ EASY CONFIG ─────────────────────────────────────────────────────────────┐
 * │ DMG_URL   direct-download link for the installer (used by every button).  │
 * │ VERSION   shown on the site.                                              │
 * └───────────────────────────────────────────────────────────────────────────┘
 */
const HN = {
  VERSION: "2.3.0",
  DMG_URL: "https://github.com/avdg-apps/HockeyNow/releases/latest/download/HockeyNow.dmg",
  EMAIL: "avdgapps@gmail.com",
  // Latest pre-release (alpha/beta). Change these two lines for each new pre-release.
  PRE_VERSION: "2.3.0-alpha.1",
  PRE_DMG_URL: "https://avdg-apps.github.io/HockeyNow/hockeynow%20v2.3.0-alpha.1.dmg",
};

document.querySelectorAll("[data-dmg]").forEach((a) => { a.href = HN.DMG_URL; a.setAttribute("download", ""); });
document.querySelectorAll("[data-dmg-pre]").forEach((a) => { a.href = HN.PRE_DMG_URL; a.setAttribute("download", ""); });
document.querySelectorAll("[data-version-pre]").forEach((el) => { el.textContent = HN.PRE_VERSION; });
document.querySelectorAll("[data-version]").forEach((el) => { el.textContent = HN.VERSION; });

/* Team logos.
 * The app loads its logos from ESPN's public logo CDN (a.espncdn.com/i/teamlogos/nhl/500/), so the
 * site does too. Every ".puck" (the coloured team circle) is upgraded to the real logo; if a logo
 * can't be loaded for any reason, the circle with the team code simply stays. Handles both ESPN
 * codes and the app's own codes (LA/LAK, NJ/NJD, SJ/SJS, TB/TBL, UTA/UTAH, WSH/WAS). */
const LOGO_BASE = "https://a.espncdn.com/i/teamlogos/nhl/";
const LOGO_SLUGS = {
  ANA: ["ana"], BOS: ["bos"], BUF: ["buf"], CAR: ["car"], CBJ: ["cbj"], CGY: ["cgy"], CHI: ["chi"], COL: ["col"],
  DAL: ["dal"], DET: ["det"], EDM: ["edm"], FLA: ["fla"], LA: ["la"], LAK: ["la"], MIN: ["min"], MTL: ["mtl"],
  NJ: ["nj"], NJD: ["nj"], NSH: ["nsh"], NYI: ["nyi"], NYR: ["nyr"], OTT: ["ott"], PHI: ["phi"], PIT: ["pit"],
  SEA: ["sea"], SJ: ["sj"], SJS: ["sj"], STL: ["stl"], TB: ["tb"], TBL: ["tb"], TOR: ["tor"],
  UTA: ["utah", "uta"], UTAH: ["utah", "uta"], VAN: ["van"], VGK: ["vgk"], WPG: ["wpg"], WSH: ["wsh"], WAS: ["wsh"],
};
const logoCache = new Map();
function resolveLogo(code) {
  if (!logoCache.has(code)) {
    const urls = [];
    (LOGO_SLUGS[code] || [code.toLowerCase()]).forEach((s) => ["500-dark", "500"].forEach((v) => urls.push(`${LOGO_BASE}${v}/${s}.png`)));
    logoCache.set(code, new Promise((resolve) => {
      const next = () => {
        const url = urls.shift();
        if (!url) return resolve(null);
        const probe = new Image();
        probe.onload = () => resolve(url);
        probe.onerror = next;
        probe.src = url;
      };
      next();
    }));
  }
  return logoCache.get(code);
}
document.querySelectorAll(".puck").forEach((puck) => {
  const code = puck.textContent.trim().toUpperCase();
  if (!/^[A-Z]{2,4}$/.test(code)) return;
  resolveLogo(code).then((url) => {
    if (!url) return;
    const img = document.createElement("img");
    img.src = url; img.alt = ""; img.decoding = "async"; img.draggable = false;
    puck.classList.add("has-logo");
    puck.setAttribute("aria-hidden", "true");
    puck.appendChild(img);
  });
});

/* mobile nav */
const nav = document.querySelector(".nav");
document.querySelector(".menu-btn")?.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  document.querySelector(".menu-btn").setAttribute("aria-expanded", open);
});
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

/* scroll reveal */
const io = "IntersectionObserver" in window
  ? new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" })
  : null;
document.querySelectorAll(".reveal").forEach((el) => (io ? io.observe(el) : el.classList.add("in")));

/* fit fixed-size mock stages to their container */
function fitStages() {
  document.querySelectorAll(".stage-fit").forEach((box) => {
    const st = box.querySelector(".stage");
    const w = +box.dataset.w, h = +box.dataset.h;
    box.style.maxWidth = w + "px";
    const s = Math.min(1, box.clientWidth / w);
    st.style.width = w + "px"; st.style.height = h + "px";
    st.style.transform = `scale(${s})`;
    box.style.height = h * s + "px";
  });
}
fitStages();
addEventListener("resize", fitStages);
addEventListener("load", fitStages);

/* notch demo: auto-expands/collapses, and follows the pointer */
document.querySelectorAll(".notch[data-auto]").forEach((n) => {
  let hovered = false;
  const tick = () => { if (!hovered) n.classList.toggle("open"); };
  n.classList.add("open");
  let timer = setInterval(tick, 3600);
  n.addEventListener("pointerenter", () => { hovered = true; n.classList.add("open"); });
  n.addEventListener("pointerleave", () => { hovered = false; });
});

/* accent colour demo */
document.querySelectorAll("[data-accent-demo]").forEach((demo) => {
  const target = demo.closest("[data-accent-scope]") || document.body;
  demo.querySelectorAll(".swatch").forEach((sw) => sw.addEventListener("click", () => {
    demo.querySelectorAll(".swatch").forEach((x) => x.classList.remove("on"));
    sw.classList.add("on");
    const c = sw.style.getPropertyValue("--c");
    target.style.setProperty("--accent", c);
    target.style.setProperty("--accent-2", c);
  }));
});

/* features sub-nav highlight */
const links = [...document.querySelectorAll(".subnav a")];
if (links.length && io) {
  const map = new Map(links.map((a) => [a.getAttribute("href").slice(1), a]));
  const so = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { links.forEach((l) => l.classList.remove("on")); const a = map.get(e.target.id); a?.classList.add("on"); a?.scrollIntoView({ inline: "center", block: "nearest" }); }
  }), { rootMargin: "-35% 0px -55% 0px" });
  map.forEach((_, id) => { const el = document.getElementById(id); if (el) so.observe(el); });
}

/* Drop-in demo videos.
 * Put an .mp4 in /media and it replaces the matching mockup automatically, e.g.
 *   <div class="media-slot" data-video="media/notch.mp4"> …mockup… </div>
 * If the file is missing, the mockup stays. Videos only play while on screen, and not at all
 * (controls shown instead) for visitors who prefer reduced motion. */
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const vio = "IntersectionObserver" in window
  ? new IntersectionObserver((es) => es.forEach((e) => {
      if (reduceMotion) return;
      e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause();
    }), { threshold: 0.25 })
  : null;
document.querySelectorAll(".media-slot[data-video]").forEach((slot) => {
  const v = document.createElement("video");
  v.muted = true; v.loop = true; v.playsInline = true; v.autoplay = !reduceMotion; v.preload = "auto";
  v.disablePictureInPicture = true;
  if (reduceMotion) v.controls = true;
  v.setAttribute("aria-label", slot.dataset.label || "HockeyNow demo");
  v.addEventListener("loadeddata", () => {
    if (v.videoWidth && v.videoHeight) v.style.aspectRatio = `${v.videoWidth} / ${v.videoHeight}`;
    slot.replaceChildren(v);
    if (!reduceMotion) v.play().catch(() => { v.controls = true; });
    if (vio) vio.observe(v);
  }, { once: true });
  v.src = slot.dataset.video;
});
