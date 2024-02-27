import { randUA } from "@ahmedrangel/rand-user-agent";
import cheerio from "cheerio";

class snapinstApi {
  constructor () {
    this.domain = "https://fastdl.app/c/";
  }

  async getMedia (link) {
    const _userAgent = randUA("desktop");
    try {
      const formData = new FormData();
      formData.append("url", link);
      formData.append("lang_code", "en");
      const response = await fetch(this.domain, {
        method: "POST",
        headers: {
          "Accept": "text/html",
          "User-Agent": _userAgent
        },
        body: formData
      });
      const data = await response.text();
      const html = cheerio.load(String(data));
      const url = html("a").attr("href");
      console.log(url);
      return { status: 200, url: url };
    } catch (e) {
      return { error: e, status: 404 };
    }
  }
}

export default snapinstApi;