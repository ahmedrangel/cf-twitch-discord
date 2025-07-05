import { $fetch } from "ofetch";
import { load } from "cheerio";

class threadsApi {
  constructor () {}
  async getFinalURL (url) {
    const regex = /\/@([^/]+)\/post\/([^/?]+)/;
    const match = url.match(regex);
    const username = match?.[1];
    const post_id = match?.[2];
    if (!username || !post_id) return null;
    return `https://www.threads.com/@${username}/post/${post_id}/media`;
  }
  async getMedia (url) {
    const postURL = await this.getFinalURL(url);
    if (!postURL) return null;
    const post = await $fetch(postURL, {
      headers: {
        "Accept": "text/html",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "same-origin",
        "User-Agent": "Cloudflare Workers (dev.ahmedrangel.com)"
      }
    }).catch(() => null);

    if (!post) return null;
    const $ = load(post);
    const scripts = $("script[type='application/json']");
    const mustInclude = ["RelayPrefetchedStreamCache", "\"video_versions\""];
    const mustNotInclude = ["relatedPosts"];

    let pk;
    let tId;
    let data;

    for (const script of scripts) {
      const content = $(script).html();
      if (content && mustInclude.every(term => content.includes(term)) && mustNotInclude.every(term => !content.includes(term))) {
        const parsed = JSON.parse(content)?.require?.[0]?.[3]?.[0]?.__bbox?.require?.[0]?.[3]?.[1]?.__bbox?.result?.data?.data;
        if (pk && tId) {
          data = parsed?.edges?.find(edge => edge.node?.id === pk)?.node.thread_items.find(item => item?.post?.id === tId)?.post;
          break;
        }
        pk = parsed?.pk;
        tId = parsed?.id;
      }
    }

    if (!data) return null;
    return {
      id: data?.id,
      video_url: data?.video_versions?.[0]?.url,
      short_url: `https://threads.com/@${data?.user?.username}/post/${data?.id}`,
      caption: data?.caption?.text
    };
  }
}

export default threadsApi;