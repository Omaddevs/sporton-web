// Mavzu (yorug‘/qorong‘i) — sahifa chizilishidan oldin, «miltillash» bo‘lmasin.
// Inline emas, alohida fayl: Content-Security-Policy inline skriptlarni taqiqlaydi.
(function () {
  try {
    var stored = localStorage.getItem('sporton-theme')
    var theme =
      stored === 'light' || stored === 'dark'
        ? stored
        : window.matchMedia('(prefers-color-scheme: light)').matches
          ? 'light'
          : 'dark'
    document.documentElement.setAttribute('data-theme', theme)
  } catch {
    document.documentElement.setAttribute('data-theme', 'dark')
  }
})()
