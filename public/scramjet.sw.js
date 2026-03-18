importScripts('scramjet.code.js');
importScripts('scramjet.config.js');

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (event) => {
    const url = event.request.url;
    const scope = self.location.origin + self.__scramjet$config.prefix;
    
    if (url.startsWith(scope)) {
        const path = url.substring(scope.length);
        
        // 静的ファイルや設定ファイルはプロキシを通さずそのまま返す
        if (!path || path === 'home.html' || path.endsWith('.js') || path.endsWith('.config.js')) {
            return;
        }

        const decodedUrl = self.__scramjet$config.decodeUrl(path);
        
        event.respondWith(
            (async () => {
                try {
                    const bareEndpoint = self.location.origin + '/bare/';

                    // ヘッダーのコピーとBare用ヘッダーの付与
                    const rawHeaders = Object.fromEntries(event.request.headers);

                    const response = await fetch(bareEndpoint, {
                        method: event.request.method,
                        headers: {
                            'x-bare-url': decodedUrl,
                            'x-bare-headers': JSON.stringify(rawHeaders),
                            'x-bare-forward-headers': '[]'
                        },
                        body: (['GET', 'HEAD'].includes(event.request.method)) ? null : await event.request.blob(),
                        redirect: 'manual'
                    });

                    // 重要：Bare Serverからのレスポンスをブラウザが解釈できる形式に変換
                    // ヘッダーをそのまま流すと、Bare Server自体の情報が表示される原因になります
                    const responseHeaders = new Headers(response.headers);
                    
                    // JSONが表示されるのを防ぐため、Content-Typeを補正（Bare Serverがjsonを返してきた場合）
                    if (responseHeaders.get('x-bare-status') === '200') {
                        // 必要に応じてここでContent-Typeを上書きするなどの処理が可能です
                    }

                    return new Response(response.body, {
                        status: response.status,
                        statusText: response.statusText,
                        headers: responseHeaders
                    });

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
