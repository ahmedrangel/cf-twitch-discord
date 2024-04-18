import { randUA } from "@ahmedrangel/rand-user-agent";
import { snapsave } from "snapsave-media-downloader";

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

    if (!data.video_url) {
      const { data } = await snapsave(link);
      console.log(data);
      return { status: 200, url: data[0]?.url, caption: "" };
    }

    return {
      status: 200,
      url: data.video_url,
      caption: data?.edge_media_to_caption?.edges[0]?.node?.text
    };
  }
}

export default igApi;