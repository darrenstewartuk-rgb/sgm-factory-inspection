'use strict';

const CACHE_PREFIX = 'sgm-inspect-';
const CACHE = CACHE_PREFIX + 'v9';
const FILES = [
  './index.html', './manifest.json', './css/styles.css',
  './js/config.js', './js/db.js', './js/report.js', './js/app.js',
  './assets/icon-192.png', './assets/icon-512.png',
];
const shell = new URL('./index.html', self.registration.scope).href;
const root = self.registration.scope;
const assets = new Set(FILES.map(path => new URL(path, root).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(
    FILES.map(path => new Request(new URL(path, root), { cache: 'reload' }))
  )));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (event.request.mode === 'navigate' && (url.origin + url.pathname === root || url.origin + url.pathname === shell)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(shell)).then(response => response || fetch(event.request)));
  } else if (assets.has(url.href)) {
    event.respondWith(caches.open(CACHE).then(cache => cache.match(event.request)).then(response => response || fetch(event.request)));
  }
});
