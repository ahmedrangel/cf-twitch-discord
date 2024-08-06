import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";
import { defaultRetry } from "../utils/helpers";

class igApi {
  constructor (ig_proxy_host) {
    this.domain = ig_proxy_host;
    this.domain_stories = "https://igram.world/api/ig/story";
  }

  async getMedia (link) {
    const short_url = link.replace(/\?.*$/, "").replace("www.", "");
    const _userAgent = randUA("desktop");
    if (link.includes("stories")) {
      const data = await $fetch(this.domain_stories + `?url=${link}`, {
        headers: {
          "Accept": "application/json",
          "User-Agent": _userAgent
        }
      });
      const url = data?.result[0]?.video_versions[0]?.url;
      if (!url) return null;
      return { status: 200, video_url: url, short_url, caption: null };
    }

    const response = await $fetch(`${this.domain}/post?url=${link}`, { ...defaultRetry }).catch(() => null);
    const data = response?.data?.shortcode_media ? response.data.shortcode_media : null;

    if (!data?.video_url || !data) {
      const { data } = await snapsave(link);
      if (!data) return null;
      return { status: 200, video_url: data[0]?.url, short_url, caption: null };
    }

    return {
      status: 200,
      video_url: data.video_url,
      short_url,
      caption: data?.edge_media_to_caption?.edges[0]?.node?.text
    };
  }
}

export default igApi;