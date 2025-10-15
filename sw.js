const CACHE = "rahla-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js"
];
self.addEventListener("install", e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener("activate", e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener("fetch", e=>{
  const url = new URL(e.request.url);
  // صور Bunny: شبكة ثم كاش
  if(url.hostname.endsWith("b-cdn.net")){
    e.respondWith(fetch(e.request).then(r=>(caches.open(CACHE).then(c=>c.put(e.request,r.clone())), r)).catch(()=>caches.match(e.request)));
    return;
  }
  // باقي الملفات: كاش ثم شبكة
  e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
});
