import scrape from "media-scraper/tiktok";
import { snapsave } from "snapsave-media-downloader";
import { obtenerIDDesdeURL } from "../utils/helpers";

class tiktokApi {
  constructor () {}

  async scrape1 (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return;
    return {
      status: 200,
      id: data.id,
      caption: data.caption,
      video_url: data.video?.url || data.video?.watermark_url,
      short_url: `https://m.tiktok.com/v/${data.id}`,
      owner: {
        name: data?.author?.name,
        username: data?.author?.username,
        avatar_url: data?.author?.avatar_url,
        url: data?.author?.url
      }
    };
  }

  async scrape2 (url) {
    const resp = await snapsave(url).catch(() => null);
    if (!resp) return;
    const id = obtenerIDDesdeURL(url);
    const { data } = resp;
    return {
      status: 200,
      id: id,
      caption: data?.description,
      video_url: data?.media[0]?.url,
      short_url: url
    };
  }

  async getMedia (url) {
    return (await this.scrape1(url)) || (await this.scrape2(url));
  }
}

export default tiktokApi;