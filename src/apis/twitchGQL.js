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
      short_url: data.permalink_url,
      owner: {
        name: data?.broadcaster.name,
        username: data?.broadcaster.username,
        avatar_url: data?.broadcaster.avatar_url,
        url: data?.broadcaster?.username ? `https://www.twitch.tv/${data.broadcaster.username}` : undefined
      }
    };
  }
}

export default twitchGQL;