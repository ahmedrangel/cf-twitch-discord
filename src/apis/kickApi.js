import { $fetch } from "ofetch";
import { obtenerIDDesdeURL } from "../utils/helpers";

class kickApi {
  constructor () {
    this.base = "https://kickclips.ahmedrangel.com";
  }

  async getMedia (url) {
    const idRegex = /^https?:\/\/kick\.com\/[^\\/]+(?:\/clips\/(clip_\w+)|\?clip=(clip_\w+))$/;
    const match = idRegex.exec(url);
    if (!match) return null;

    const id = match[1] || match[2];
    const endpoint = `${this.base}/api/clip`;

    const data = await $fetch(endpoint + "/" + id).catch(() => null);
    const tmp = await $fetch.raw(`https://clips.kick.com/tmp/${id}.mp4`).catch(() => null);

    let video_url;
    if (tmp?.headers?.get("content-type") === "video/mp4") {
      video_url = `https://clips.kick.com/tmp/${id}.mp4`;
    } else {
      const trigger = await $fetch(endpoint, { method: "POST", body: { url } }).catch(() => null);
      video_url = trigger?.url;
    }

    console.log(data);
    const slug = data?.clip?.channel?.slug;
    const caption = data?.clip?.title;
    const short_url = `https://kick.com/${slug || "u"}/clips/${id}`;

    if (!video_url) return null;
    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default kickApi;