import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";
import { getQuery } from "ufo";
import { defaultRetry } from "../utils/helpers";


const getInstagramId = (url) => {
  const regex = /instagram.com\/(?:[A-Za-z0-9_.]+\/)?(p|reels|reel|stories|share)\/([A-Za-z0-9-_]+)/;
  const match = url.match(regex);
  return match && match[2] ? match[2] : null;
};

const formatShortURL = (url) => {
  return url.replace(/\?.*$/, "").replace("www.", "");
};

class igApi {
  constructor (ig_proxy_host) {
    this.domain = "https://www.instagram.com/api/graphql";
    this.domain_stories = "https://api-ig.igram.world/api/story";
  }

  async getMedia (link) {
    const _userAgent = randUA("desktop");
    const headers = {
      "X-IG-App-ID": "936619743392459",
      "X-FB-LSD": "AVqbxe3J_YA",
      "X-ASBD-ID": "129477",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent": _userAgent
    };

    if (link.includes("/stories")) {
      const data = await $fetch(this.domain_stories, {
        query: { url: link },
        headers: {
          "Accept": "application/json",
          "User-Agent": _userAgent
        }
      });
      const url = data?.result[0]?.video_versions[0]?.url;
      if (!url) return null;
      return { status: 200, id: getInstagramId(link), video_url: url, short_url: formatShortURL(link), caption: null };
    }

    if (link.includes("/share")) {
      link = (await $fetch.raw(link, { headers }).catch(() => null))?.url || link;
    }

    const id = getInstagramId(link);
    const short_url = formatShortURL(link);
    const { img_index, igsh } = getQuery(link);

    const response = await $fetch(this.domain, {
      ...defaultRetry,
      method: "POST",
      query: {
        doc_id: "10015901848480474",
        lsd: "AVqbxe3J_YA",
        variables: { shortcode: id }
      },
      responseType: "json",
      headers
    }).catch(() => null);

    const postData = response?.data?.xdt_shortcode_media || null;
    if (!postData) {
      const { data } = await snapsave(link);
      if (!data) return null;
      const is_photo = data?.media[0]?.type === "image";
      return { status: 200, id, video_url: data?.media[0]?.url, short_url, is_photo, caption: null };
    }

    const edgeSideCar = postData?.edge_sidecar_to_children?.edges || [];
    if (edgeSideCar.length) {
      const media = edgeSideCar[igsh ? img_index : Number(img_index) - 1 || 0]?.node || null;
      const mediaId = img_index > 1 ? `${id}-${igsh ? "m" : "w"}${Number(img_index)}` : id;
      if (!media) return null;
      if (!media?.is_video) return { status: 200, id: mediaId, short_url, is_photo: true };
      return { status: 200, id: mediaId, video_url: media.video_url, short_url, caption: postData?.edge_media_to_caption?.edges[0]?.node?.text };
    }
    if (!postData.is_video) return { status: 200, id, short_url, is_photo: true };

    return {
      status: 200,
      id,
      video_url: postData.video_url,
      short_url,
      caption: postData?.edge_media_to_caption?.edges[0]?.node?.text
    };
  }
}

export default igApi;