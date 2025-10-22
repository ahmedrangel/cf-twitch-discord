import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";
import scrape from "media-scraper/facebook";
import { defaultRetry } from "../utils/helpers";

class fdownloaderApi {
  constructor () {}

  async getMedia (url) {
    const short_url = url.replace(/([&?](?!v=)[^=]+=[^&]*)/g, "").replace("&", "?").replace("www.", "");
    const regex = /(?:watch\?v=|watch\/\?v=|watch\/|gg\/|videos\/|reel\/|reels\/|share\/[\w+]\/)(\w+)/;
    const match = short_url.match(regex);
    const id = match ? match[1] : null;

    if (url.includes("/share/")) {
      const shareFetch = await $fetch.raw(url, {
        method: "HEAD",
        headers: {
          "Accept": "*/*",
          "User-Agent": "Cloudflare Workers/dev.ahmedrangel.com"
        }
      }).catch(() => null);
      if (!shareFetch) return null;
      url = !shareFetch.url.includes("login") ? shareFetch.url : url;
    }

    const withScraper = async () => {
      console.log("Using FB scraper");
      const data = await scrape(url).catch(() => null);
      if (!data) return null;
      return {
        status: 200,
        id: data.id,
        caption: data.caption,
        video_url: data.video.hd_url || data.video.sd_url,
        short_url: data.permalink_url
      };
    };
    const withSnapsave = async () => {
      console.log("Using Snapsave for FB");
      try {
        const { data } = await snapsave(url, { ...defaultRetry });
        if (!data) return null;
        return { id, video_url: data?.media[0]?.url, short_url, status: 200 };
      } catch (e) {
        console.error("Error in fdownloaderApi.getMedia:", e);
        return null;
      }
    };
    if (!id) return null;
    return (await withScraper()) || (await withSnapsave());
  }
}

export default fdownloaderApi;