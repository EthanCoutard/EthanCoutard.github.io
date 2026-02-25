document.documentElement.classList.add("js")

const y1 = document.getElementById("year")
if (y1) y1.textContent = new Date().getFullYear()
const y2 = document.getElementById("year2")
if (y2) y2.textContent = new Date().getFullYear()

const video = document.getElementById("video")
if (video) {
  const tryPlay = () => video.play().catch(() => {})
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) tryPlay()
  })
  tryPlay()
}

function hideLoader() {
  const loader = document.getElementById("loader")
  if (!loader) return
  loader.classList.add("hidden")
  setTimeout(() => loader.remove(), 800)
}

document.addEventListener("DOMContentLoaded", () => {
  setTimeout(hideLoader, 450)
})

window.addEventListener("load", () => {
  hideLoader()
})

setTimeout(() => {
  hideLoader()
}, 3500)

const els = Array.from(document.querySelectorAll(".reveal"))
const io = new IntersectionObserver(
  entries => {
    for (const e of entries) {
      if (e.isIntersecting) e.target.classList.add("show")
    }
  },
  { threshold: 0.12 }
)
els.forEach(el => io.observe(el))

const links = Array.from(document.querySelectorAll(".nav-link"))
  .filter(a => (a.getAttribute("href") || "").startsWith("#") && (a.getAttribute("href") || "").length > 1)

const sections = links
  .map(a => document.getElementById(a.getAttribute("href").slice(1)))
  .filter(Boolean)

let currentId = null
const topOffset = 120

function setActive(id) {
  if (id === currentId) return
  currentId = id
  for (const a of links) a.classList.toggle("active", a.getAttribute("href") === "#" + id)
}

function onScrollSpy() {
  const bottomOffset = 40
  const doc = document.documentElement
  const scrollMax = doc.scrollHeight - window.innerHeight

  if (scrollMax > bottomOffset && window.scrollY >= scrollMax - bottomOffset) {
    setActive("contact")
    return
  }

  let bestId = sections[0]?.id || null
  let bestDist = Infinity

  for (const s of sections) {
    const r = s.getBoundingClientRect()
    if (r.bottom <= topOffset) continue
    const dist = Math.abs(r.top - topOffset)
    if (dist < bestDist) {
      bestDist = dist
      bestId = s.id
    }
  }

  if (bestId) setActive(bestId)
}

let ticking = false
window.addEventListener("scroll", () => {
  if (ticking) return
  ticking = true
  requestAnimationFrame(() => {
    onScrollSpy()
    ticking = false
  })
}, { passive: true })

window.addEventListener("resize", () => {
  onScrollSpy()
})

onScrollSpy()

function sendMail(e) {
  e.preventDefault()
  const name = document.getElementById("name")?.value?.trim() || ""
  const email = document.getElementById("email")?.value?.trim() || ""
  const objet = document.getElementById("objet-mail")?.value?.trim() || ""
  const message = document.getElementById("message")?.value?.trim() || ""
  const hint = document.getElementById("hint")

  if (!name || !email || !message || !objet) {
    if (hint) hint.textContent = "Veuillez remplir tout les champs."
    return false
  }

  const subject = encodeURIComponent(`${objet} - ${name}`)
  const body = encodeURIComponent(`Nom: ${name}\nEmail: ${email}\n\n${message}`)

  if (hint) hint.textContent = "Ouverture de l'application de mail"
  window.location.href = `mailto:ethancoutardpro@gmail.com?subject=${subject}&body=${body}`
  return false
}

window.sendMail = sendMail

const menuBtn = document.getElementById("menuBtn")
const sidebar = document.getElementById("sidebar")

function closeMenu() {
  document.body.classList.remove("menu-open")
}

if (menuBtn) {
  menuBtn.addEventListener("click", () => {
    document.body.classList.toggle("menu-open")
  })
}

if (sidebar) {
  sidebar.addEventListener("click", e => {
    const a = e.target.closest("a")
    if (a && a.classList.contains("nav-link")) closeMenu()
  })
}

document.addEventListener("keydown", e => {
  if (e.key === "Escape") closeMenu()
})

document.addEventListener("click", e => {
  if (!document.body.classList.contains("menu-open")) return
  const inside = e.target.closest("#sidebar") || e.target.closest("#menuBtn")
  if (!inside) closeMenu()
})

const parallax = document.querySelector(".orbit-parallax")
const orbitWrap = document.querySelector(".orbit-wrapper")

if (parallax && orbitWrap) {
  let tx = 0
  let ty = 0
  let x = 0
  let y = 0
  let t = null

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

  const setPaused = on => orbitWrap.classList.toggle("is-paused", on)

  window.addEventListener("mousemove", e => {
    const w = window.innerWidth || 1
    const h = window.innerHeight || 1
    const nx = ((e.clientX - w/2) / (w/2))
    const ny = ((e.clientY - h/2) / (h/2))

    tx = clamp(nx * 55, -65, 65)
    ty = clamp(-ny * 45, -55, 55)

    setPaused(true)
    if (t) clearTimeout(t)
    t = setTimeout(() => setPaused(false), 10)
  }, { passive:true })

  const loop = () => {
    x += (tx - x) * 0.14
    y += (ty - y) * 0.14
    parallax.style.setProperty("--px", x.toFixed(3) + "deg")
    parallax.style.setProperty("--py", y.toFixed(3) + "deg")
    requestAnimationFrame(loop)
  }
  loop()
}

(() => {
  const selects = document.querySelectorAll(".cselect")

  selects.forEach((wrap) => {
    const selectId = wrap.dataset.select
    const real = document.getElementById(selectId)
    const btn = wrap.querySelector(".cselect-btn")
    const valueEl = wrap.querySelector(".cselect-value")
    const menu = wrap.querySelector(".cselect-menu")
    const items = [...wrap.querySelectorAll(".cselect-item")]

    const close = () => {
      wrap.classList.remove("open")
      btn.setAttribute("aria-expanded", "false")
    }

    const open = () => {
      wrap.classList.add("open")
      btn.setAttribute("aria-expanded", "true")
      menu.focus()
    }

    const setValue = (val, label) => {
      real.value = val
      valueEl.textContent = label
      items.forEach((i) => i.classList.toggle("is-selected", i.dataset.value === val))
    }

    btn.addEventListener("click", () => {
      if (wrap.classList.contains("open")) close()
      else open()
    })

    items.forEach((item) => {
      item.addEventListener("click", () => {
        setValue(item.dataset.value, item.textContent)
        close()
        btn.focus()
      })
    })

    document.addEventListener("click", (e) => {
      if (!wrap.contains(e.target)) close()
    })

    document.addEventListener("keydown", (e) => {
      if (!wrap.classList.contains("open")) return
      if (e.key === "Escape") close()
    })

    const initOpt = real.options[real.selectedIndex]
    if (initOpt && initOpt.value) setValue(initOpt.value, initOpt.textContent)
  })
})()
