import { $fetch } from "ofetch";

class kickApi {
  constructor () {
    this.base = "https://kickclips.ahmedrangel.com";
  }

  async getMedia (url) {
    if (url.includes("kickbot.com/clip/")) {
      const idRegex = /^https?:\/\/kickbot\.com\/clip\/(\w+)/;
      const match = idRegex.exec(url);
      if (!match) return null;
      const id = match[1];
      const short_url = `https://kickbot.com/clip/${id}`;
      const test = await $fetch(`https://clips.kickbotcdn.com/kickbot-hls/${id}/${id}.mp4`, {
        responseType: "blob"
      }).catch((e) => {
        console.log(e);
        return null;
      });
      console.log(test.size, test.type);
      return { id, video_url: `https://clips.kickbotcdn.com/kickbot-hls/${id}/${id}.mp4`, short_url, status: 200 };
    }

    const idRegex = /^https?:\/\/kick\.com\/[^\\/]+(?:\/clips\/(clip_\w+)|\?clip=(clip_\w+))(?:\&.*|\?.*)?$/;
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

    const slug = data?.clip?.channel?.slug;
    const caption = data?.clip?.title;
    const short_url = `https://kick.com/${slug || "u"}/clips/${id}`;

    if (!video_url) return null;
    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default kickApi;