import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";
import { load } from "cheerio";
import { getQuery } from "ufo";

class y2mateApi {
  constructor () {
    this.base = "https://www.y2mate.com";
    this.base2 = "https://ssyoutube.online/yt-video-detail/";
    this._userAgent = randUA("desktop");
    this.sessionTimestamp = Math.floor(Date.now() / 1000);
    this.sessionUserId = Math.floor(Math.random() * 1e9) + 1e9;
    this.cookie = `_ga=GA1.1.${this.sessionUserId}.${this.sessionTimestamp}`;
  }

  async get360pMedia (id) {
    try {
      const data = await $fetch(this.base2, {
        ...defaultRetry,
        method: "POST",
        headers: {
          "User-Agent": this._userAgent,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `videoURL=https://youtu.be/${id}`
      }).catch(() => null);
      if (!data) return null;

      const $ = load(data);
      const indexElements = $(".videoOptions").not(".hidden");
      const videoOptions = $("input").slice(0, indexElements.length);
      const videos = [];

      for (const el of videoOptions) {
        const url = $(el).attr("value");
        const query = getQuery(url);
        const itag = query?.itag;
        const mime = query?.mime;
        if (mime === "video/mp4") {
          videos.push({ url, itag, mime });
        }
      }
      return videos[0].url;
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getVideoToken (id) {
    try {
      const formData = new FormData();
      formData.append("k_query", `https://youtu.be/${id}`);
      formData.append("k_page", "home");
      formData.append("hl", "en");
      formData.append("q_auto", "0");
      const data = await $fetch(`${this.base}/mates/en948/analyzeV2/ajax`, {
        ...defaultRetry,
        method: "POST",
        headers: {
          "User-Agent": this._userAgent,
          "Referer": `${this.base}/en948/`,
          "Origin": this.base,
          "Cookie": this.cookie
        },
        body: formData
      }).catch(() => null);
      if (!data) return null;
      const q720ps = data?.links?.mp4["22"]?.k; // 720p (shorts)
      const q720ps2 = data?.links?.mp4["298"]?.k; // 720p (shorts 2)
      const q480p = data?.links?.mp4["135"]?.k; // 480p
      const q360ps = data?.links?.mp4["18"]?.k; // 360p (shorts)
      const q360p = data?.links?.mp4["134"]?.k;
      const q240p = data?.links?.mp4["133"]?.k; // 240p+
      const qAuto = data?.links?.mp4["auto"]?.k; // auto
      const hd_token = q720ps ? q720ps : q720ps2 ? q720ps2 : q480p ? q480p : q360p ? q360p : q360ps ? q360ps : q240p ? q240p : qAuto;
      return { hd_token };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getVideo (id) {
    const videoToken = await this.getVideoToken(id);
    const hd_token = videoToken?.hd_token;
    if (!hd_token) return this.get360pMedia(id);
    try {
      const formData = new FormData();
      formData.append("vid", id);
      formData.append("k", hd_token);
      const data = await $fetch(`${this.base}/mates/convertV2/index`, {
        ...defaultRetry,
        method: "POST",
        headers: {
          "User-Agent": this._userAgent,
          "Referer": `${this.base}/youtube/` + id,
          "Origin": this.base,
          "Cookie": this.cookie
        },
        body: formData
      }).catch((e) => console.log(e));
      if (!data) return null;
      return data.dlink;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default y2mateApi;