importScripts('scramjet.code.js');
importScripts('scramjet.config.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    const scope = self.location.origin + self.__scramjet$config.prefix;
    
    if (url.startsWith(scope)) {
        const path = url.substring(scope.length);
        
        // 静的ファイルやHome画面はそのまま通す
        if (!path || path === 'home.html' || path.endsWith('.js')) return;

        const decodedUrl = self.__scramjet$config.decodeUrl(path);
        
        event.respondWith(
            (async () => {
                try {
                    // 基本的なフェッチ（実際にはBare Server経由が推奨）
                    const response = await fetch(decodedUrl, {
                        headers: event.request.headers,
                        redirect: 'follow'
                    });
                    return response;
                } catch (err) {
                    return new Response('Proxy Error: ' + err.message, { status: 500 });
                }
            })()
        );
    }
});
