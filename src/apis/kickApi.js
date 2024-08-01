import { $fetch } from "ofetch";
import { obtenerIDDesdeURL } from "../utils/helpers";

class kickApi {
  constructor () {
    this.base = "https://kickclips.ahmedrangel.com";
  }

  async getMedia (url) {
    const link = new URL(url);
    const id = link.searchParams.get("clip");
    const slug = obtenerIDDesdeURL(link);
    const endpoint = `${this.base}/api/clip/${id}`;

    const data = await $fetch(endpoint).catch(() => null);
    const tmp = await $fetch.raw(`https://clips.kick.com/tmp/${id}.mp4`).catch(() => null);

    let video_url;
    if (tmp?.headers?.get("content-type") === "video/mp4") {
      video_url = `https://clips.kick.com/tmp/${id}.mp4`;
    } else {
      const trigger = await $fetch(endpoint, { method: "POST" }).catch(() => null);
      video_url = trigger?.url;
    }

    console.log(data);
    const caption = data?.clip?.title;
    const short_url = `https://kick.com/${slug}?clip=${id}`;

    if (!video_url) return { status: 404 };
    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default kickApi;