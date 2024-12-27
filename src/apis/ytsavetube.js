import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class ytsavetubeApi {
  constructor () {
    this.base = "https://cdn53.savetube.su";
    this._userAgent = randUA("desktop");
  }

  async getVideo (id) {
    const info = await $fetch(`${this.base}/info`, {
      method: "POST",
      body: { url: `https://www.youtube.com/watch?v=${id}` },
      headers: { "User-Agent": this._userAgent }
    }).catch(() => null);

    if (!info) return null;

    const download = await $fetch(`${this.base}/download`, {
      ...defaultRetry,
      method: "POST",
      body: { key: info.data.key, downloadType: "video", quality: "720" },
      headers: { "User-Agent": this._userAgent }
    }).catch(() => null);

    if (!download) return null;

    return download.data.downloadUrl;
  }
}

export default ytsavetubeApi;