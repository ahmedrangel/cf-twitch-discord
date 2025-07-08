import scrape from "media-scraper/twitch";

class twitchGQL {

  constructor () {}

  async getMedia (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return;
    return {
      status: 200,
      id: data.slug,
      caption: data.caption,
      video_url: data.video_versions[0].url,
      short_url: data.permalink_url
    };
  }
}

export default twitchGQL;