import scrape from "media-scraper/tiktok";

class tiktokApi {
  constructor () {}

  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return;
    return {
      status: 200,
      id: data.id,
      caption: data.caption,
      video_url: data.video?.url || data.video?.watermark_url,
      short_url: `https://m.tiktok.com/v/${data.id}`,
      owner: {
        name: data?.author?.name,
        username: data?.author?.username,
        avatar_url: data?.author?.avatar_url,
        url: data?.author?.username ? `https://www.tiktok.com/@${data.author.username}` : undefined
      }
    };
  }
}

export default tiktokApi;