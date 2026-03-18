importScripts('scramjet.code.js');
importScripts('scramjet.config.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    const scope = self.location.origin + self.__scramjet$config.prefix;
    
    if (url.startsWith(scope)) {
        const path = url.substring(scope.length);
        
        // 静的ファイルやHome画面、設定ファイルはプロキシを通さずそのまま返す
        if (!path || path === 'home.html' || path.endsWith('.js') || path.endsWith('.config.js')) {
            return;
        }

        const decodedUrl = self.__scramjet$config.decodeUrl(path);
        
        event.respondWith(
            (async () => {
                try {
                    // 自サーバーのBareエンドポイントを指定
                    const bareEndpoint = self.location.origin + '/bare/';

                    // リクエストヘッダーの準備
                    const rawHeaders = Object.fromEntries(event.request.headers);

                    // Bare Server経由でリクエストを送信
                    const response = await fetch(bareEndpoint, {
                        method: event.request.method,
                        headers: {
                            'x-bare-url': decodedUrl,
                            'x-bare-headers': JSON.stringify(rawHeaders),
                            'x-bare-forward-headers': '[]'
                        },
                        // GET/HEAD以外でボディがある場合は送信
                        body: (['GET', 'HEAD'].includes(event.request.method)) ? null : await event.request.blob(),
                        redirect: 'manual'
                    });
                    
                    return response;
                } catch (err) {
                    console.error('Bare Fetch Error:', err);
                    return new Response('Proxy Error: ' + err.message, {
                        status: 500,
                        headers: { 'Content-Type': 'text/plain' }
                    });
                }
            })()
        );
    }
});
