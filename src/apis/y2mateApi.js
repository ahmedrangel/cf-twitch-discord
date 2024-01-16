import { randUA } from "@ahmedrangel/rand-user-agent";

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
      formData.append("q_auto", "1");
      const response = await fetch(`${this.base}/mates/analyzeV2/ajax`, {
        method: "POST",
        headers: {
          "User-Agent": this._userAgent,
          "Referer": `${this.base}/youtube/`,
          "Origin": this.base
        },
        body: formData
      });
      const data = await response.json();
      const hd_token = data?.links?.mp4["22"]?.k; // 720p
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
      const response = await fetch(`${this.base}/mates/convertV2/index`, {
        method: "POST",
        headers: {
          "User-Agent": this._userAgent,
          "Referer": `${this.base}/youtube/` + id,
          "Origin": this.base
        },
        body: formData
      });
      const data = await response.json();
      return data.dlink;
    } catch(e) {
      console.log(e);
      return null;
    }
  }
}

export default y2mateApi;