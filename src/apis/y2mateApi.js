import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class y2mateApi {
  constructor () {
    this.base = "https://www.y2mate.com";
    this._userAgent = randUA("desktop");
  }

  async getVideoToken (id, filter) {
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
          "Referer": `${this.base}/youtube/`,
          "Origin": this.base
        },
        body: formData
      }).catch(() => null);
      if (!data) return null;
      const q720 = data?.links?.mp4["22"]?.k; // 720p (shorts)
      const q480 = data?.links?.mp4["135"]?.k; // 480p
      const q360ps = data?.links?.mp4["18"]?.k; // 360p (shorts)
      const q360p = data?.links?.mp4["134"]?.k;
      const q240p = data?.links?.mp4["133"]?.k; // 240p+
      const qAuto = data?.links?.mp4["auto"]?.k; // auto
      const hd_token = q720 ? q720 : q480 ? q480 : q360p ? q360p : q360ps ? q360ps : q240p ? q240p : qAuto;
      return { hd_token };
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  async getMedia (id, filter) {
    const { hd_token } = await this.getVideoToken(id, filter);
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
          "Origin": this.base
        },
        body: formData
      }).catch(() => null);
      if (!data) return null;
      return data.dlink;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default y2mateApi;