import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";
import { defaultRetry } from "../utils/helpers";

class igApi {
  constructor (ig_proxy_host) {
    this.domain = "https://www.instagram.com/api/graphql";
    this.domain_stories = "https://api-ig.igram.world/api/story";
  }

  async getMedia (link, id) {
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

    const response = await $fetch(this.domain, {
      ...defaultRetry,
      method: "POST",
      params: {
        doc_id: "10015901848480474",
        lsd: "AVqbxe3J_YA",
        variables: { shortcode: id }
      },
      responseType: "json",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-IG-App-ID": "936619743392459",
        "X-FB-LSD": "AVqbxe3J_YA",
        "X-ASBD-ID": "129477",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": _userAgent
      }
    }).catch(() => null);
    const postData = response?.data?.xdt_shortcode_media || null;
    if (!postData) {
      const { data } = await snapsave(link);
      if (!data) return null;
      return { status: 200, video_url: data[0]?.url, short_url, caption: null };
    }

    if (!postData.is_video) return { status: 200, short_url, is_photo: true };

    return {
      status: 200,
      video_url: postData.video_url,
      short_url,
      caption: postData?.edge_media_to_caption?.edges[0]?.node?.text
    };
  }
}

export default igApi;