/* =====================================================
   CONFIG
   Setiap scene dipetakan ke salah satu dari 3 video.
   Video diputar apa adanya (autoplay + loop) sebagai
   background, hanya berpindah/crossfade saat scene aktif
   berubah — tidak ada scrubbing frame berdasarkan scroll.
===================================================== */
const CONFIG = {
  sceneVideo: {
    home: "v1",
    about: "v2",
    skills: "v3",
    projects: "v1",
    contact: "v2"
  }
};

/* =====================================================
   ELEMENTS
===================================================== */
const videos = {
  v1: document.getElementById("v1"),
  v2: document.getElementById("v2"),
  v3: document.getElementById("v3")
};
const preloader = document.getElementById("preloader");
const loaderProgress = document.getElementById("loaderProgress");
const progressBar = document.getElementById("progressBar");
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".scene");
const mobileMenu = document.getElementById("mobileMenu");
const navigation = document.getElementById("navigation");

let activeVideoKey = null;

/* =====================================================
   PRELOAD VIDEOS
===================================================== */
function loadVideo(video) {
  return new Promise((resolve) => {
    if (video.readyState >= 2) return resolve();
    video.addEventListener("loadeddata", resolve, { once: true });
    video.addEventListener("error", resolve, { once: true });
  });
}

async function preload() {
  const list = Object.values(videos);
  let loaded = 0;

  list.forEach((v) => {
    loadVideo(v).then(() => {
      loaded++;
      const pct = Math.round((loaded / list.length) * 100);
      loaderProgress.style.width = pct + "%";
    });
  });

  await Promise.all(list.map(loadVideo));

  setTimeout(() => {
    preloader.classList.add("loaded");
    setActiveVideo("home");
    startScrollWatcher();
  }, 400);
}

/* =====================================================
   ACTIVE VIDEO SWITCH (crossfade, play only the active one)
===================================================== */
function setActiveVideo(sceneName) {
  const key = CONFIG.sceneVideo[sceneName] || "v1";
  if (key === activeVideoKey) return;
  activeVideoKey = key;

  Object.entries(videos).forEach(([k, video]) => {
    if (k === key) {
      video.classList.add("active");
      video.play().catch(() => {});
    } else {
      video.classList.remove("active");
    }
  });
}

/* =====================================================
   SCROLL -> ACTIVE SCENE
===================================================== */
function getActiveScene() {
  const viewportCenter = window.scrollY + window.innerHeight * 0.5;
  let current = sections[0];
  sections.forEach((sec) => {
    if (sec.offsetTop <= viewportCenter) current = sec;
  });
  return current.dataset.scene;
}

function updateNav(sceneName) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.section === sceneName);
  });
}

function updateProgressBar() {
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (window.scrollY / docHeight) * 100 : 0;
  progressBar.style.height = pct + "%";
}

function onScroll() {
  const sceneName = getActiveScene();
  setActiveVideo(sceneName);
  updateNav(sceneName);
  updateProgressBar();
}

function startScrollWatcher() {
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
}

/* =====================================================
   REVEAL ON SCROLL
===================================================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
      }
    });
  },
  { threshold: 0.2 }
);
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* =====================================================
   NAV LINK SMOOTH SCROLL + MOBILE MENU
===================================================== */
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("mobile-open");
    mobileMenu.classList.remove("active");
  });
});

mobileMenu.addEventListener("click", () => {
  navigation.classList.toggle("mobile-open");
  mobileMenu.classList.toggle("active");
});

/* =====================================================
   INIT
===================================================== */
preload();
