import scrape from "media-scraper/threads";

class threadsApi {
  constructor () {}
  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    return {
      status: 200,
      id: data.code,
      caption: data.caption,
      video_url: data?.video_versions?.[0]?.url || data?.carousel_media?.[0]?.video_versions?.[0]?.url,
      short_url: data.permalink_url,
      owner: {
        name: data?.author?.name,
        username: data?.author?.username,
        avatar_url: data?.author?.avatar_url,
        url: data?.author?.url
      }
    };
  }
}

export default threadsApi;