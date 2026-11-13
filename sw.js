const CACHE='brotzeit-v1.1.6';
const SCRIPT='./app.js?v=1.1.6';
const ASSETS=['./','./index.html',SCRIPT,'./manifest.webmanifest','./icon.png','./icon-512.png'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>
    cache.addAll(ASSETS.map(url=>new Request(new URL(url,self.location.href),{cache:'reload'})))
  ).then(()=>self.skipWaiting()));
});

self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(key=>key.startsWith('brotzeit-')&&key!==CACHE).map(key=>caches.delete(key))
  )).then(()=>self.clients.claim()));
});

self.addEventListener('fetch',event=>{
  const {request}=event;
  if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
  event.respondWith(caches.open(CACHE).then(async cache=>{
    if(request.mode==='navigate'){
      try{
        return await fetch(request);
      }catch{
        return await cache.match(request)||await cache.match('./index.html')||Response.error();
      }
    }
    return await cache.match(request)||fetch(request);
  }));
});
