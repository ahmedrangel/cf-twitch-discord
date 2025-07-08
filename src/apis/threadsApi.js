import scrape from "media-scraper/threads";

class threadsApi {
  constructor () {}
  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    return {
      status: 200,
      id: data.code,
      caption: data.caption,
      video_url: data.video_versions[0].url,
      short_url: data.permalink_url
    };
  }
}

export default threadsApi;