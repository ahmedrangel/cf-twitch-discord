import { randUA } from "@ahmedrangel/rand-user-agent";
import { load } from "cheerio";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class fdownloaderApi {
  constructor () {
    this.base = "https://v3.fdownloader.net/api";
  }

  async getMedia (link) {
    function generarCadenaAleatoria (longitud) {
      return [...Array(longitud)].map(() => "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))).join("");
    }
    const token = generarCadenaAleatoria(64);
    const _userAgent = randUA("desktop");
    try {
      const formData = new FormData();
      formData.append("q", link);
      formData.append("lang", "en");
      formData.append("v", "v2");
      formData.append("web", "fdownloader.net");
      formData.append("k_token", token);
      const data = await $fetch(`${this.base}/ajaxSearch`, {
        ...defaultRetry,
        method: "POST",
        headers: {
          "Accept": "application/json",
          "User-Agent": _userAgent
        },
        body: formData
      });
      if (data.status === "ok") {
        const html = load(String(data.data));
        const url = html("td a").attr("href");
        return { url, status: 200 };
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

export default fdownloaderApi;