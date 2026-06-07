/**
 * sw.js — Origami Underworld Service Worker (NO-CACHE PASS-THROUGH)
 *
 * MODE: NO-CACHE PASS-THROUGH — user mandate 2026-05-26
 *   "add no-caching for this entire game".
 *
 * Behavior:
 *   - install: skip waiting; no precache.
 *   - activate: DELETE every Cache Storage entry the worker ever wrote
 *     AND self.registration.unregister() so the worker stops running
 *     after this one cycle finishes. clients.claim() so the current
 *     pages immediately stop talking to the old cache-first worker.
 *   - fetch: pure network pass-through (no event.respondWith). Browser
 *     HTTP cache + iframe `?v=` query-string busts own freshness.
 *
 * To restore offline-play later, revert this file to the pre-mandate
 * cache-first version in git history.
 */
const CACHE = 'origami-v8-2026-06-07-i18n-l3-v8328-sc1-sc2-sc3';

self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        // 1. Nuke every cache this worker (or any previous version) wrote.
        try {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        } catch (_) {}

        // 2. Claim active pages so they stop using the old (cache-first) SW
        //    that may still be intercepting fetches in their tab.
        try { await self.clients.claim(); } catch (_) {}

        // 3. Self-unregister. Next page load won't have a service worker at
        //    all — pure network for everything. (Browser navigation will
        //    still respect the registration object until the page reloads,
        //    which is why we keep the no-op fetch listener below for the
        //    rest of this cycle.)
        try { await self.registration.unregister(); } catch (_) {}
    })());
});

// No event.respondWith() ⇒ the browser handles the request itself with no
// service-worker interception. We keep the listener registered (empty body)
// so any old in-flight request resolves cleanly while activate is running.
self.addEventListener('fetch', () => { /* pass-through, no caching */ });
