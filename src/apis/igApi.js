import scrape from "media-scraper/instagram";
import { getQuery } from "ufo";

class igApi {
  constructor () {}

  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    const { img_index, igsh } = getQuery(url);
    const edgeSideCar = data.carousel_media || [];
    const id = data.code;
    if (edgeSideCar.length) {
      const media = edgeSideCar[igsh ? img_index || 0 : Number(img_index) - 1 || 0] || null;
      const mediaId = img_index > 1 ? `${id}-${igsh ? "m" : "w"}${Number(img_index)}` : id;
      console.log(media, img_index);
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
        short_url: data.permalink_url
      };
    }
    return {
      status: 200,
      id,
      caption: data.caption,
      video_url: data.video.url,
      short_url: data.permalink_url
    };
  }
}

export default igApi;