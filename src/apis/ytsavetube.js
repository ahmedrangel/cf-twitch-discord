import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class ytsavetubeApi {
  constructor () {
    this.base = "https://cdn59.savetube.me";
    this._userAgent = randUA("desktop");
  }

  async getVideo (id) {
    const info = await $fetch(`${this.base}/info`, {
      params: { url: `https://www.youtube.com/watch?v=${id}` },
      headers: { "User-Agent": this._userAgent }
    }).catch(() => null);

    if (!info) return null;

    const download = await $fetch(`${this.base}/download/video/720/${info.data.key}`, {
      ...defaultRetry,
      headers: { "User-Agent": this._userAgent }
    }).catch(() => null);

    if (!download) return null;

    return download.data.downloadUrl;
  }
}

export default ytsavetubeApi;