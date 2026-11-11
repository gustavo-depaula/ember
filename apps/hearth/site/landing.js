// Same language rule as the landing: ?lang=, a /pt/ path, the saved choice, the browser.
;(function () {
  var root = document.documentElement
  var titles = { en: root.dataset.titleEn, pt: root.dataset.titlePt }
  function set(lang) {
    root.dataset.lang = lang
    root.lang = lang === 'pt' ? 'pt-BR' : 'en'
    document.title = titles[lang]
  }
  var saved = null
  try { saved = localStorage.getItem('lang') } catch (e) {}
  var asked = /[?&]lang=(pt|en)\b/.exec(location.search)
  var page = /^\/pt\//.test(location.pathname) ? 'pt' : null
  set((asked && asked[1]) || page || saved || (/^pt/i.test(navigator.language) ? 'pt' : 'en'))
  document.getElementById('switch').addEventListener('click', function (e) {
    e.preventDefault()
    var next = root.dataset.lang === 'pt' ? 'en' : 'pt'
    set(next)
    try { localStorage.setItem('lang', next) } catch (e) {}
  })
})()
