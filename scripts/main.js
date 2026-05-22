import { contactWidget, faqs, featureCards } from "./content.js"

const qs = (sel, el = document) => el.querySelector(sel)
const qsa = (sel, el = document) => Array.from(el.querySelectorAll(sel))

const renderFeatures = () => {
  const grid = qs("[data-feature-grid]")
  if (!grid) return

  grid.innerHTML = featureCards
    .map(
      (f) => `
      <article class="feature-card" data-reveal>
        <div class="feature-icon" aria-hidden="true">${f.icon}</div>
        <div class="feature-name">${f.title}</div>
        <div class="feature-desc">${f.desc}</div>
        <div class="feature-action">
          <a class="btn btn-primary" href="${f.href}">${f.cta}</a>
        </div>
      </article>
    `,
    )
    .join("")
}

const renderFaq = () => {
  const wrap = qs("[data-faq]")
  if (!wrap) return

  wrap.innerHTML = faqs
    .map(
      (item, idx) => `
      <div class="faq-item" data-open="false">
        <button class="faq-q" type="button" aria-expanded="false" aria-controls="faq-a-${idx}">
          <span>${item.q}</span>
          <span class="faq-chevron" aria-hidden="true">›</span>
        </button>
        <div class="faq-a" id="faq-a-${idx}">${item.a}</div>
      </div>
    `,
    )
    .join("")

  const items = qsa(".faq-item", wrap)
  items.forEach((node) => {
    const btn = qs(".faq-q", node)
    if (!btn) return

    btn.addEventListener("click", () => {
      const isOpen = node.getAttribute("data-open") === "true"
      items.forEach((n) => {
        n.setAttribute("data-open", "false")
        const b = qs(".faq-q", n)
        if (b) b.setAttribute("aria-expanded", "false")
      })
      node.setAttribute("data-open", isOpen ? "false" : "true")
      btn.setAttribute("aria-expanded", isOpen ? "false" : "true")
    })
  })
}

const setupMobileMenu = () => {
  const trigger = qs("[data-menu-trigger]")
  const menu = qs("[data-mobile-menu]")
  if (!trigger || !menu) return

  const close = () => {
    menu.hidden = true
    trigger.setAttribute("aria-label", "打开菜单")
  }

  const toggle = () => {
    menu.hidden = !menu.hidden
    trigger.setAttribute("aria-label", menu.hidden ? "打开菜单" : "关闭菜单")
  }

  trigger.addEventListener("click", toggle)
  qsa("a", menu).forEach((a) => a.addEventListener("click", close))
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close()
  })
}

const setupReveal = () => {
  const els = qsa("[data-reveal]")
  if (!els.length) return

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add("is-visible")
        io.unobserve(entry.target)
      })
    },
    { threshold: 0.18 },
  )

  els.forEach((el) => io.observe(el))
}

const setupActiveNav = () => {
  const links = qsa(".nav-link")
  if (!links.length) return

  const targets = links
    .map((a) => {
      const id = a.getAttribute("href")?.replace("#", "")
      if (!id) return null
      const el = document.getElementById(id)
      if (!el) return null
      return { a, el, id }
    })
    .filter(Boolean)

  if (!targets.length) return

  const io = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0]
      if (!visible) return

      const id = visible.target.id
      targets.forEach((t) => t.a.classList.toggle("is-active", t.id === id))
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: [0, 0.2, 0.6] },
  )

  targets.forEach((t) => io.observe(t.el))
}

const setupContactFloat = () => {
  const root = qs("[data-contact-float]")
  if (!root) return

  const btn = qs("[data-contact-float-btn]", root)
  const panel = qs("[data-contact-float-panel]", root)
  const img = qs("[data-contact-float-qr]", root)
  const titles = qsa("[data-contact-float-title]", root)
  const subtitles = qsa("[data-contact-float-subtitle]", root)
  const hint = qs("[data-contact-float-hint]", root)
  const close = qs("[data-contact-float-close]", root)

  if (!btn || !panel || !img || !titles.length || !subtitles.length || !hint) return

  titles.forEach((el) => (el.textContent = contactWidget.title))
  subtitles.forEach((el) => (el.textContent = contactWidget.subtitle))
  img.alt = `${contactWidget.title}二维码`
  img.src = contactWidget.qrSrc

  const open = () => {
    root.setAttribute("data-open", "true")
    btn.setAttribute("aria-expanded", "true")
  }

  const hide = () => {
    root.setAttribute("data-open", "false")
    btn.setAttribute("aria-expanded", "false")
  }

  btn.addEventListener("click", () => {
    const isOpen = root.getAttribute("data-open") === "true"
    if (isOpen) hide()
    else open()
  })

  close?.addEventListener("click", hide)

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hide()
  })

  window.addEventListener("click", (e) => {
    if (!(e.target instanceof Node)) return
    if (!root.contains(e.target)) hide()
  })

  img.addEventListener("load", () => {
    img.hidden = false
    hint.hidden = true
  })

  img.addEventListener("error", () => {
    img.hidden = true
    hint.hidden = false
    hint.textContent = `未找到客服二维码：${contactWidget.qrSrc}。请将图片放到该路径后重新部署。`
  })
}

renderFeatures()
renderFaq()
setupMobileMenu()
setupReveal()
setupActiveNav()
setupContactFloat()
