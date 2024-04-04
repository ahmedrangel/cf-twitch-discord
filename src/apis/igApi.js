import { randUA } from "@ahmedrangel/rand-user-agent";

class igApi {
  constructor () {
    this.domain = "https://snapinsta.vip/wp-json/aio-dl/video-data/";
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

    const response = await fetch(this.domain + `?url=${link}`, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "User-Agent": _userAgent
      }
    });
    const data = await response.json();
    const medias = data.medias;
    const maxMediaSize = Math.max(...medias.map(obj => obj.size));
    const url = medias.find(obj => obj.size === maxMediaSize).url;
    console.log(url);
    return { status: 200, url: url, caption: data?.title };
  }
}

export default igApi;