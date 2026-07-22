const CACHE='card-maker-messages-v4';
const FILES=["/","/index.html","/app.html","/occasions.html","/assets/site.css","/assets/site.js","/assets/messages.js","/assets/pdf.js","/assets/app.js","/assets/icon-192.png","/assets/icon-512.png"];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(res=>{const copy=res.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return res;}).catch(()=>caches.match('/404.html'))));});
