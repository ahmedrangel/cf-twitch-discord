import { randUA } from "@ahmedrangel/rand-user-agent";
import * as cheerio from "cheerio";

class fdownloaderApi {
  constructor () {
    this.base = "https://v3.fdownloader.net/api";
  }

  async getMedia (link) {
    function generarCadenaAleatoria(longitud) {
      return [...Array(longitud)].map(() => "abcdefghijklmnopqrstuvwxyz0123456789".charAt(Math.floor(Math.random() * 36))).join("");
    }
    const token = generarCadenaAleatoria(64);
    const _userAgent = randUA("desktop", "chrome", "linux");
    try {
      const formData = new FormData();
      formData.append("q", link);
      formData.append("lang", "en");
      formData.append("v", "v2");
      formData.append("web", "fdownloader.net");
      formData.append("k_token", token);
      const response = await fetch(`${this.base}/ajaxSearch`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "User-Agent": _userAgent
        },
        body: formData
      });
      const data = await response.json();
      if (data.status === "ok") {
        const html = cheerio.load(String(data.data));
        const url = html("td a").attr("href");
        return { url, status: 200};
      }
      return { status: 429 };
    } catch (e) {
      return { status: 404 };
    }
  }
}

export default fdownloaderApi;