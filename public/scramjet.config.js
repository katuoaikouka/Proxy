self.__scramjet$config = {
    prefix: '/scramjet/',
    codec: self.scramjet.codecs.xor,
    config: '/scramjet/scramjet.config.js',
    worker: '/scramjet/scramjet.sw.js',
    code: '/scramjet/scramjet.code.js',
    encodeUrl: (url) => {
        return self.__scramjet$config.codec.encode(url);
    },
    decodeUrl: (url) => {
        return self.__scramjet$config.codec.decode(url);
    }
};
