import { $fetch } from "ofetch";
import { randUA } from "@ahmedrangel/rand-user-agent";
import { load } from "cheerio";
import { defaultRetry } from "../utils/helpers";

class tiktokApi {
  constructor () {
    this.base = "https://api22-normal-c-alisg.tiktokv.com";
    this.base_3rd = "https://tikwm.com/api/";
  }

  async getMedia (url) {
    if (!url?.includes("tiktok.com/")) return null;
    const method_1 = async () => {
      try {
        console.log("Using TikTok API");
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
        const known_iid = ["7318518857994389254"];
        const query = {
          region: "US",
          carrier_region: "US",
          aweme_id: tt_id,
          iid: known_iid[Math.floor(Math.random() * known_iid.length)],
          device_id: device_id,
          channel: "googleplay",
          app_name: "musical_ly",
          version_code: 350103,
          device_platform: "android",
          device_type: "ASUS_Z01QD",
          os_version: 14
        };

        const headers = {
          "content-type": "application/x-www-form-urlencoded",
          "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36"
        };

        const data = await $fetch(`${this.base}/aweme/v1/feed/`, { query, headers, ...defaultRetry }).catch(() => null);
        if (!data) return null;

        const aweme_details = data?.aweme_list?.find((item) => item.aweme_id === tt_id);
        const video_url = aweme_details?.video?.play_addr?.url_list?.[0] || aweme_details?.video?.download_addr?.url_list?.[0];
        const short_url = "https://m.tiktok.com/v/" + aweme_details?.aweme_id;
        const caption = aweme_details?.desc?.trim().replace(/\s+$/, "");
        return { id: tt_id, video_url, short_url, caption, status: 200 };
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    const method_2 = async () => {
      console.log("Using TikWM API");
      const query = { url };
      const { data } = await $fetch(this.base_3rd, { query, ...defaultRetry }).catch((e) => console.log(e), null);
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