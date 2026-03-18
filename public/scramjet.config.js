/**
 * Scramjet Proxy Config
 */
const config = {
    prefix: '/scramjet/',
    // 互換性のためにxorを使用
    codec: (typeof self.scramjet !== 'undefined') ? self.scramjet.codecs.xor : null,
    config: '/scramjet/scramjet.config.js',
    worker: '/scramjet/scramjet.sw.js',
    code: '/scramjet/scramjet.code.js',
    encodeUrl: (url) => {
        if (!__scramjet$config.codec) return btoa(url); // フォールバック
        return __scramjet$config.codec.encode(url);
    },
    decodeUrl: (url) => {
        if (!__scramjet$config.codec) return atob(url); // フォールバック
        return __scramjet$config.codec.decode(url);
    }
};

self.__scramjet$config = config;
