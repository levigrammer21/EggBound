// Simple offline cache for Eggbound PWA
const CACHE = "eggbound-cache-v1";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./sw.js"];
self.addEventListener("install", (e)=>{
  e.waitUntil((async ()=>{
    const c = await caches.open(CACHE);
    await c.addAll(ASSETS);
    self.skipWaiting();
  })());
});
self.addEventListener("activate", (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.map(k=> (k===CACHE)?null:caches.delete(k)));
    self.clients.claim();
  })());
});
self.addEventListener("fetch", (e)=>{
  const url = new URL(e.request.url);
  // cache-first for our static assets, network-first for external (like PokeAPI)
  if(url.origin === location.origin){
    e.respondWith((async ()=>{
      const c = await caches.open(CACHE);
      const hit = await c.match(e.request);
      if(hit) return hit;
      const res = await fetch(e.request);
      c.put(e.request, res.clone());
      return res;
    })());
  }
});
