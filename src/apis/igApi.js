import { randUA } from "@ahmedrangel/rand-user-agent";
import * as cheerio from "cheerio";

class igApi {
  constructor (ig_proxy_host) {
    this.domain = ig_proxy_host;
    this.domain_posts = "https://fastdl.app/c/";
    this.domain_stories = "https://igram.world/api/ig/story";
  }

  async getMedia (link) {
    const _userAgent = randUA("desktop");
    if (link.includes("stories")) {
      const response = await fetch(this.domain_stories + `?url=${link}`, {
        headers: {
          "Accept": "application/json",
          "User-Agent": _userAgent
        }
      });
      const data = await response.json();
      const url = data.result[0].video_versions[0].url;
      return { status: 200, url: url };
    }

    try {
      const response = await fetch(`${this.domain}/ig/post?url=${link}`);
      const data = await response.json();
      return {
        status: 200,
        url: data?.video_versions[0]?.url,
        caption: data?.caption?.text
      };
    } catch(e) {
      const formData = new FormData();
      formData.append("url", link);
      formData.append("lang_code", "en");
      const response = await fetch(this.domain_posts, {
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
      return { status: 200, url: url, caption: "" };
    }
  }
}

export default igApi;