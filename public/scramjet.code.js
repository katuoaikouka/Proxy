self.scramjet = {
    codecs: {
        xor: {
            encode: (str) => {
                if (!str) return str;
                return encodeURIComponent(str.split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join(''));
            },
            decode: (str) => {
                if (!str) return str;
                let [path, ...query] = str.split('?');
                return decodeURIComponent(path).split('').map((char, ind) => ind % 2 ? String.fromCharCode(char.charCodeAt() ^ 2) : char).join('') + (query.length ? '?' + query.join('?') : '');
            }
        }
    }
};
