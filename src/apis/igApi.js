import { randUA } from "@ahmedrangel/rand-user-agent";

class igApi {
  constructor (ig_proxy_host) {
    this.domain = ig_proxy_host;
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

    const response = await fetch(`${this.domain}/ig/post?url=${link}`);
    const data = await response.json();
    return {
      status: 200,
      url: data?.video_versions[0]?.url,
      caption: data?.caption?.text
    };
  }
}

export default igApi;