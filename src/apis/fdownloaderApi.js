import { $fetch } from "ofetch";
import { snapsave } from "snapsave-media-downloader";
import { load } from "cheerio";

class fdownloaderApi {
  constructor () {}

  async getMedia (url) {
    const short_url = url.replace(/([&?](?!v=)[^=]+=[^&]*)/g, "").replace("&", "?").replace("www.", "");
    const regex = /(?:watch\?v=|watch\/\?v=|watch\/|gg\/|videos\/|reel\/|reels\/|share\/[\w+]\/)(\w+)/;
    const match = short_url.match(regex);
    const id = match ? match[1] : null;

    const withScraper = async () => {
      console.log("Using FB scraper");
      const post = await $fetch.raw(url, {
        headers: {
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.205 Safari/537.36"
        }
      }).catch(() => null);
      if (!post) return null;
      const $ = load(post?._data);

      const scripts = $("script[type='application/json']");
      const metaDescription = $("meta[name='description']")?.attr("content");

      const mustInclude = ["RelayPrefetchedStreamCache", "videoDeliveryLegacyFields"];
      const mustNotInclude = ["CometUFI"];

      let data;

      for (const script of scripts) {
        const content = $(script).html();
        if (content && mustInclude.every(term => content.includes(term) && !mustNotInclude.some(term => content.includes(term)))) {
          const json = JSON.parse(content);
          data = json?.require?.[0]?.[3]?.[0]?.__bbox?.require?.find(item => item?.includes("RelayPrefetchedStreamCache"))?.[3]?.[1]?.__bbox?.result?.data?.video;
        }
      }

      const caption = data?.creation_story?.message?.text || metaDescription;
      const attachment = data?.story?.attachments?.find(item => item?.media?.id === data?.id);
      const media = attachment?.media || data.creation_story.short_form_video_context.playback_video;
      const delivery = media?.videoDeliveryLegacyFields;
      const video_url = delivery?.browser_native_hd_url || delivery?.browser_native_sd_url;
      if (!video_url) return null;
      return {
        status: 200,
        id: data?.id,
        video_url,
        short_url: (media?.permalink_url || media?.url || short_url).replace("www.", ""),
        caption
      };
    };
    const withSnapsave = async () => {
      console.log("Using Snapsave for FB");
      try {
        const fbFetch = await $fetch.raw(url, {
          headers: {
            "Accept": "*/*",
            "User-Agent": "Cloudflare Workers/dev.ahmedrangel.com"
          }
        }).catch(() => null);
        const postURL = fbFetch?.url ? fbFetch.url : url;
        const { data } = await snapsave(postURL);
        if (!data) return null;
        return { id, video_url: data?.media[0]?.url, short_url, status: 200 };
      } catch (e) {
        console.error("Error in fdownloaderApi.getMedia:", e);
        return null;
      }
    };
    if (!id) return null;
    return (await withScraper()) || (await withSnapsave());
  }
}

export default fdownloaderApi;