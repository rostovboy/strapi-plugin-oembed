//? Fully rewritten by github.com/sashapop10 with rutube support
"use strict";

const axios = require("axios");
const enc = encodeURIComponent;
const strategies = {};

const pattern =
  /^(https?:\/\/)?(www\.)?(youtu\.be|youtube\.com|soundcloud\.com|vimeo\.com|tiktok\.com|open\.spotify\.com|twitter\.com|codepen\.io|rutube\.ru)/i;

const validate = (url) => url.match(pattern);
const ERR_DISABLED = "Embedding has been disabled for this media";
const ERR_NOT_FOUND = "This URL can't be found";
const ERR_INVALID_URL = "Invalid URL";

module.exports = () => ({
  async fetch(url) {
    const domain = validate(url);
    if (!domain) return { error: ERR_INVALID_URL };
    if (!strategies[domain[3]]) return { error: ERR_INVALID_URL };
    const { url: host, pull } = strategies[domain[3]];

    try {
      const data = await axios.get(host(url)).then((res) => res.data);
      const { title, thumbnail_url: thumbnail } = data;
      const preset = { url, title, thumbnail, rawData: data, mime: null };
      return Object.assign(preset, pull(data));
    } catch (error) {
      const status = error?.response?.status;
      if (status === 404) return { error: ERR_NOT_FOUND };
      if (status === 401) return { error: ERR_DISABLED };
      throw new Error(error);
    }
  },
});

strategies["rutube.ru"] = {
  url: (url) => `https://rutube.ru/api/oembed/?url=${enc(url)}/&format=json`,
  pull: () => ({ mime: "video/rutube" }),
};

strategies["youtu.be"] = strategies["youtube.com"] = {
  url: (url) => `https://www.youtube.com/oembed?url=${enc(url)}&format=json`,
  pull: () => ({ mime: "video/youtube" }),
};

strategies["soundcloud.com"] = {
  url: (url) => `https://www.soundcloud.com/oembed?url=${enc(url)}&format=json`,
  pull: () => ({ mime: "audio/soundcloud" }),
};

strategies["vimeo.com"] = {
  url: (url) => `https://vimeo.com/api/oembed.json?url=${enc(url)}`,
  pull: () => ({ mime: "video/vimeo" }),
};

strategies["tiktok.com"] = {
  url: (url) => `https://www.tiktok.com/oembed?url=${enc(url)}&format=json`,
  pull: () => ({ mime: "video/tiktok" }),
};

strategies["open.spotify.com"] = {
  url: (url) => `https://open.spotify.com/oembed?url=${enc(url)}`,
  pull: () => ({ mime: "audio/spotify" }),
};

strategies["codepen.io"] = {
  url: (url) => `https://codepen.io/api/oembed?format=json&url=${enc(url)}`,
  pull: () => ({ mime: "application/codepen" }),
};

strategies["twitter.com"] = {
  url: (url) => `https://publish.twitter.com/oembed?url=${enc(url)}`,
  pull: (data) => ({
    mime: "text/twitter",
    title: data.author_name,
    thumbnail: null,
  }),
};
