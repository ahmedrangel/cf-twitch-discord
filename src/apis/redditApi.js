import { randUA } from "@ahmedrangel/rand-user-agent";
import { load } from "cheerio";
import { $fetch } from "ofetch";
import { withQuery } from "ufo";

class redditApi {

  constructor (reddit_token) {
    this.apiBase = "https://api.reddit.com/api";
    this.downloaderBase = "https://redvid.io";
    this.reddit_token = reddit_token;
    this.userAgent = randUA("desktop");
    this.headers = { "Cookie": this.reddit_token, "User-Agent": this.userAgent };
  }

  async getMedia (url) {
    const headers = this.headers;
    if (url.includes("v.redd.it") || url.includes("/s/")) {
      const data = await $fetch.raw(url.replace("v.redd.it", "www.reddit.com/video"), { headers }).catch((e) => console.log(e));
      url = data?.url;
    }

    const regex = /\/(?:comments\/|s\/)([a-zA-Z0-9]+)/;
    const id = url.match(regex)[1];

    const { data } = await $fetch(withQuery(`${this.apiBase}/info.json`, { id: `t3_${id}` }), { headers }).catch(() => null);

    if (!data || (!data?.children[0]?.data?.is_video && !data?.children[0]?.data?.url.includes(".gif"))) return null;

    const short_url = data?.children[0]?.data?.url;
    const caption = data?.children[0]?.data?.title;

    if (short_url.includes(".gif")) return { id, video_url: short_url, short_url, caption, format: "gif", status: 200 };

    const fallback_video = data?.children[0]?.data?.media?.reddit_video?.fallback_url;
    if (data?.children[0]?.data?.media?.reddit_video?.is_gif) return { id, video_url: fallback_video, short_url, caption, status: 200 };

    const dash = data?.children[0]?.data?.media?.reddit_video?.dash_url;
    const xmlString = await $fetch(dash, { responseType: "text" }).catch(() => null);
    const dashAudio = xmlString.match(/<AdaptationSet[^>]+contentType="audio"[^>]*>[\s\S]+?<BaseURL>(.*?)<\/BaseURL>/)[1];
    const fallback_audio = `${short_url}/${dashAudio}`;

    const download = await $fetch(withQuery(`${this.downloaderBase}/download-link`, {
      token: {
        video_url: fallback_video,
        audio_url: fallback_audio,
        id
      }
    })).catch(() => null);

    if (!download?.url) return null;

    const video_url = `${this.downloaderBase}${download?.url}`;

    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default redditApi;