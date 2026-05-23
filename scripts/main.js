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
    if (menu.hidden) return
    menu.hidden = true
    trigger.setAttribute("aria-label", "打开菜单")
    trigger.setAttribute("aria-expanded", "false")
  }

  const open = () => {
    if (!menu.hidden) return
    menu.hidden = false
    trigger.setAttribute("aria-label", "关闭菜单")
    trigger.setAttribute("aria-expanded", "true")
  }

  const toggle = () => {
    if (menu.hidden) open()
    else close()
  }

  trigger.addEventListener("click", toggle)
  qsa("a", menu).forEach((a) => a.addEventListener("click", close))
  window.addEventListener("click", (e) => {
    if (menu.hidden) return
    if (!(e.target instanceof Node)) return
    if (trigger.contains(e.target) || menu.contains(e.target)) return
    close()
  })
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
  const backdrop = qs("[data-contact-backdrop]")
  if (!root) return

  const btn = qs("[data-contact-float-btn]", root)
  const panel = qs("[data-contact-float-panel]", root)
  const img = qs("[data-contact-float-qr]", root)
  const titles = qsa("[data-contact-float-title]", root)
  const subtitles = qsa("[data-contact-float-subtitle]", root)
  const hint = qs("[data-contact-float-hint]", root)
  const close = qs("[data-contact-float-close]", root)
  const actions = qs("[data-contact-float-actions]", root)
  const appLabel = qs("[data-contact-float-app-label]", root)
  const appName = qs("[data-contact-float-app-name]", root)
  const urlLabel = qs("[data-contact-float-url-label]", root)
  const urlValue = qs("[data-contact-float-url]", root)
  const idLabel = qs("[data-contact-float-id-label]", root)
  const idValue = qs("[data-contact-float-id]", root)
  const copyUrlBtn = qs("[data-contact-float-copy-url]", root)
  const copyIdBtn = qs("[data-contact-float-copy-id]", root)
  const toast = qs("[data-contact-float-toast]", root)

  if (!btn || !panel || !img || !titles.length || !subtitles.length || !hint || !actions || !appLabel || !appName || !urlLabel || !urlValue || !idLabel || !idValue || !copyUrlBtn || !copyIdBtn || !toast) return

  titles.forEach((el) => (el.textContent = contactWidget.title))
  const subtitleText = String(contactWidget.subtitle ?? "").trim()
  subtitles.forEach((el) => {
    el.textContent = subtitleText
    el.hidden = !subtitleText
  })
  img.alt = `${contactWidget.title}二维码`
  img.src = contactWidget.qrSrc
  appLabel.textContent = contactWidget.recommendAppLabel ?? "客服软件推荐："
  appName.textContent = contactWidget.recommendAppName ?? ""
  urlLabel.textContent = contactWidget.appUrlLabel ?? "下载地址："
  urlValue.textContent = contactWidget.appUrl ?? ""
  idLabel.textContent = contactWidget.serviceIdLabel ?? "客服ID："
  idValue.textContent = contactWidget.serviceId ?? ""
  const canCopyUrl = Boolean(String(contactWidget.appUrl ?? "").trim())
  const canCopyId = Boolean(String(contactWidget.serviceId ?? "").trim())
  copyUrlBtn.disabled = !canCopyUrl
  copyIdBtn.disabled = !canCopyId

  const open = () => {
    root.setAttribute("data-open", "true")
    btn.setAttribute("aria-expanded", "true")
    document.body.classList.add("is-modal-open")
    if (backdrop) {
      backdrop.hidden = false
      requestAnimationFrame(() => backdrop.classList.add("is-visible"))
    }
  }

  const hide = () => {
    root.setAttribute("data-open", "false")
    btn.setAttribute("aria-expanded", "false")
    document.body.classList.remove("is-modal-open")
    toast.hidden = true
    toast.textContent = ""
    if (backdrop) {
      backdrop.classList.remove("is-visible")
      window.setTimeout(() => {
        backdrop.hidden = true
      }, 180)
    }
  }

  btn.addEventListener("click", () => {
    const isOpen = root.getAttribute("data-open") === "true"
    if (isOpen) hide()
    else open()
  })

  close?.addEventListener("click", hide)

  const copyText = async (val, okText = "已复制") => {
    const text = String(val ?? "").trim()
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      toast.textContent = okText
    } catch {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.setAttribute("readonly", "true")
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(ta)
      toast.textContent = ok ? okText : "复制失败"
    }

    toast.hidden = false
    window.setTimeout(() => {
      toast.hidden = true
      toast.textContent = ""
    }, 1400)
  }

  copyUrlBtn.addEventListener("click", () => copyText(contactWidget.appUrl, "已复制网址"))
  copyIdBtn.addEventListener("click", () => copyText(contactWidget.serviceId, "已复制客服ID"))

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

  const isMobile = window.matchMedia?.("(max-width: 899px)")?.matches
  if (isMobile && contactWidget.autoOpenOnMobile) {
    const key = "wpk_contact_auto_opened"
    if (!sessionStorage.getItem(key)) {
      sessionStorage.setItem(key, "1")
      window.setTimeout(() => open(), 900)
    }
  }
}

renderFeatures()
renderFaq()
setupMobileMenu()
setupReveal()
setupActiveNav()
setupContactFloat()
