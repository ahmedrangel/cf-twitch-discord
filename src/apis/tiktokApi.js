import { withQuery } from "ufo";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";
import { randUA } from "@ahmedrangel/rand-user-agent";
import { load } from "cheerio";

class tiktokApi {
  constructor () {
    this.base = "https://api22-normal-c-useast2a.tiktokv.com";
    this.base_3rd = "https://tikwm.com/api/";
  }

  async getMedia (url) {
    const method_1 = async () => {
      try {
        const html = await $fetch(url, { headers: { "User-Agent": randUA("desktop") } });
        const body = load(html);
        const scripts = [];

        body("script").each((i, el) => {
          const script = body(el).html();
          if (script.includes("__DEFAULT_SCOPE__")) {
            scripts.push(script);
          }
        });

        const json = JSON.parse(scripts);
        const tt_id = json["__DEFAULT_SCOPE__"]["webapp.video-detail"].itemInfo.itemStruct.id;
        const device_id = json["__DEFAULT_SCOPE__"]["webapp.app-context"].wid;
        const known_iid = ["7351144126450059040", "7351149742343391009", "7351153174894626592"];
        const query = {
          aweme_ids: `[${tt_id}]`,
          iid: known_iid[Math.floor(Math.random() * known_iid.length)],
          device_id,
          channel: "googleplay",
          aid: 1233,
          app_name: "musical_ly",
          version_code: 350103,
          version_name: "35.1.3",
          device_platform: "android",
          device_type: "Pixel 8 Pro",
          os_version: 14
        };

        const headers = {
          "content-type": "application/x-www-form-urlencoded",
          "User-Agent": "com.zhiliaoapp.musically/2023501030 (Linux; U; Android 14; en_US; Pixel 8 Pro; Build/TP1A.220624.014;tt-ok/3.12.13.4-tiktok)",
          "x-argus": ""
        };

        const data = await $fetch(withQuery(`${this.base}/aweme/v1/multi/aweme/detail/`, query), { headers, ...defaultRetry }).catch(() => null);
        if (!data) return null;

        const video_url = data?.aweme_details[0]?.video?.play_addr?.url_list[0];
        const short_url = "https://m.tiktok.com/v/" + data?.aweme_details[0]?.aweme_id;
        const caption = data?.aweme_details[0]?.desc?.trim().replace(/\s+$/, "");
        return { id: tt_id, video_url, short_url, caption, status: 200 };
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    const method_2 = async () => {
      const query = { url };
      const { data } = await $fetch(withQuery(this.base_3rd, query), { ...defaultRetry }).catch((e) => console.log(e), null);
      if (!data) return null;
      const video_url = data?.play;
      const short_url = "https://m.tiktok.com/v/" + data?.id;
      const caption = data?.title?.trim().replace(/\s+$/, "");
      if (data?.images?.length) return { id: data?.id, short_url, caption, is_photo: true, status: 200 };
      return { id: data?.id, video_url, short_url, caption, status: 200 };
    };

    return await method_1() || await method_2() || null;
  }
}

export default tiktokApi;