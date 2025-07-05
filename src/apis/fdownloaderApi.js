import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";

class fdownloaderApi {
  constructor () {}

  async getMedia (url) {
    try {
      const fbFetch = await $fetch.raw(url, {
        headers: {
          "Accept": "*/*",
          "User-Agent": "Cloudflare Workers/dev.ahmedrangel.com"
        }
      }).catch(() => null);
      const postURL = fbFetch?.url ? fbFetch.url : url;
      const { data } = await snapsave(postURL);
      if (!data) return null;
      const short_url = url.replace(/([&?](?!v=)[^=]+=[^&]*)/g, "").replace("&", "?").replace("www.", "");
      const regex = /(?:watch\?v=|watch\/|gg\/|videos\/|reel\/|reels\/|share\/[\w+]\/)(\w+)/;
      const match = short_url.match(regex);
      const id = match ? match[1] : null;
      return { id, video_url: data?.media[0]?.url, short_url, status: 200 };
    } catch (e) {
      console.error("Error in fdownloaderApi.getMedia:", e);
      return null;
    }
  }
}

export default fdownloaderApi;