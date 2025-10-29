import scrape from "media-scraper/reddit";

class redditApi {
  constructor () {}

  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return;
    return {
      status: 200,
      id: data.id,
      caption: data.caption,
      video_url: data.video.url,
      short_url: data.short_url,
      owner: {
        name: data?.author?.name,
        username: data?.author?.username,
        avatar_url: data?.author?.avatar_url,
        url: data?.author?.url
      }
    };
  }
}

export default redditApi;