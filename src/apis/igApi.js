import scrape from "media-scraper/instagram";
import { snapsave } from "snapsave-media-downloader";
import { getQuery } from "ufo";
import { obtenerIDDesdeURL } from "../utils/helpers";

class igApi {
  constructor () {}

  async scrape1 (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return null;
    const { img_index, igsh } = getQuery(url);
    const edgeSideCar = data?.carousel_media || [];
    const id = data.code;
    const owner = {
      name: data?.author?.name,
      username: data?.author?.username,
      avatar_url: data?.author?.avatar_url,
      url: data?.author?.url
    };
    if (edgeSideCar.length) {
      const media = edgeSideCar[igsh ? img_index || 0 : Number(img_index) - 1 || 0] || null;
      const mediaId = img_index > 0 ? `${id}-${igsh ? "m" : "w"}${Number(img_index)}` : id;
      if (!media) return null;
      if (media.type === "image") {
        return {
          status: 200,
          id: mediaId,
          short_url: data.permalink_url,
          is_photo: true
        };
      }
      return {
        status: 200,
        id: mediaId,
        caption: data.caption,
        video_url: media.video.url,
        short_url: data.permalink_url,
        owner
      };
    }
    if (!data?.video?.url) return null;
    return {
      status: 200,
      id,
      caption: data.caption,
      video_url: data.video.url,
      short_url: data.permalink_url,
      owner
    };
  }

  async scrape2 (url) {
    const data = await snapsave(url).catch(() => null);
    if (!data?.data?.media) return null;
    const { img_index, igsh } = getQuery(url);
    const id = obtenerIDDesdeURL(url);
    const media = data.data.media[igsh ? img_index || 0 : Number(img_index || 1) - 1 || 0];
    const mediaId = img_index > 0 ? `${id}-${igsh ? "m" : "w"}${Number(img_index)}` : id;
    const shortUrl = url.split("?")?.[0];
    if (!media) return null;
    if (media.type === "image") {
      return {
        status: 200,
        id: mediaId,
        short_url: shortUrl,
        is_photo: true
      };
    }
    return {
      status: 200,
      id: mediaId,
      caption: data?.data?.description,
      video_url: media?.url,
      short_url: shortUrl
    };
  }

  async getMedia (url) {
    return await this.scrape1(url) || await this.scrape2(url);
  }
}

export default igApi;