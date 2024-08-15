import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";
import { load } from "cheerio";
import { getQuery } from "ufo";

class y2mateApi {
  constructor () {
    this.base = "https://ssyoutube.online/yt-video-detail/";
    this._userAgent = randUA("desktop");
  }

  async getMedia (id, filter) {
    try {
      const data = await $fetch(this.base, {
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

      /*
      const q720 = data?.links?.mp4["22"]?.k; // 720p (shorts)
      const q480 = data?.links?.mp4["135"]?.k; // 480p
      const q360ps = data?.links?.mp4["18"]?.k; // 360p (shorts)
      const q360p = data?.links?.mp4["134"]?.k;
      const q240p = data?.links?.mp4["133"]?.k; // 240p+
      const qAuto = data?.links?.mp4["auto"]?.k; // auto
      const hd_token = q720 ? q720 : q480 ? q480 : q360p ? q360p : q360ps ? q360ps : q240p ? q240p : qAuto;
      return { hd_token };*/
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default y2mateApi;