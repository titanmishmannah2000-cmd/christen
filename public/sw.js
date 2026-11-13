/* Christen service worker: lets the app open and read without a connection.
   - The app itself (HTML, scripts, styles, fonts, icons, map lettering) is saved
     when the worker installs, from the list the build writes to precache.json.
   - Bible text, notes, connections and the Hebrew and Greek words are saved the first time each is opened,
     or all at once from Settings > Use without internet.
   - Map tiles and paintings from other sites are kept as they are seen, up to a limit. */
const SHELL = 'verbum-shell-'
const DATA = 'verbum-data-v1'
const MEDIA = 'verbum-media-v1'
const MEDIA_LIMIT = 800

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('precache.json', { cache: 'no-store' })
    const { version, files } = await res.json()
    const cache = await caches.open(SHELL + version)
    await cache.addAll(files)
    self.skipWaiting()
  })())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const res = await fetch('precache.json', { cache: 'no-store' }).catch(() => null)
    const current = res ? SHELL + (await res.json()).version : null
    for (const key of await caches.keys()) {
      if (key.startsWith(SHELL) && current && key !== current) await caches.delete(key)
    }
    await self.clients.claim()
  })())
})

const isData = (path) => /\/(bible|bible-[a-z]+|notes|threads|original|original\/defs)\/[^/]+\.json$/.test(path) || /\/(context|engraved|footnotes|parallels)\.json$/.test(path) || /\/(evans|gnb)\/[^/]+\.json$/.test(path) || /\/gnb\/img\/[^/]+\.webp$/.test(path)

async function fromShell(request) {
  for (const key of await caches.keys()) {
    if (!key.startsWith(SHELL)) continue
    const hit = await (await caches.open(key)).match(request, { ignoreSearch: true })
    if (hit) return hit
  }
  return null
}

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName)
  const keys = await cache.keys()
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i])
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)

  // Pages: the newest from the network, or the saved copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(async () => (await fromShell('index.html')) || (await fromShell('./')) || Response.error()))
    return
  }

  if (url.origin === self.location.origin) {
    // Bible text, notes, connections: answer from the saved copy at once, and refresh it in the background.
    if (isData(url.pathname)) {
      event.respondWith((async () => {
        const cache = await caches.open(DATA)
        const saved = await cache.match(request, { ignoreSearch: true })
        const fresh = fetch(request).then(res => { if (res.ok) cache.put(request, res.clone()); return res }).catch(() => null)
        if (saved) { event.waitUntil(fresh); return saved }
        return (await fresh) || Response.error()
      })())
      return
    }
    // Everything else from this site: the saved app first, then the network.
    event.respondWith((async () => {
      const saved = await fromShell(request)
      if (saved) return saved
      const res = await fetch(request)
      if (res.ok && url.pathname.includes('/assets/')) (await caches.open(DATA)).put(request, res.clone())
      return res
    })().catch(async () => (await caches.match(request)) || Response.error()))
    return
  }

  // Map tiles and paintings: keep what has been seen, so they show again offline.
  if (/arcgisonline\.com|wikimedia\.org|openstreetmap\.org/.test(url.hostname)) {
    event.respondWith((async () => {
      const cache = await caches.open(MEDIA)
      const saved = await cache.match(request)
      if (saved) return saved
      const res = await fetch(request)
      if (res.ok || res.type === 'opaque') { cache.put(request, res.clone()); event.waitUntil(trim(MEDIA, MEDIA_LIMIT)) }
      return res
    })())
  }
})
