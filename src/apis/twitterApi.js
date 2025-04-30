import { randUA } from "@ahmedrangel/rand-user-agent";
import { $fetch } from "ofetch";

class twitterApi {
  constructor (twitter_bearer_token, x_cookie) {
    this.twitter_bearer_token = twitter_bearer_token;
    this.x_cookie = x_cookie;
  }

  async getTweet (url) {
    const vxtwitter = "api.vxtwitter.com" ;
    url = url.replace(/twitter\.com|x\.com/, vxtwitter);
    const data = await $fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": randUA("desktop")
      }
    });
    const { tweetID, text, media_extended } = data;
    const id = tweetID;
    const caption = text;
    const short_url = `https://x.com/i/status/${id}`;
    const video = media_extended.find(media => media.type === "video" && (media.url.includes("avc1") || media.url.includes("/pu/vid/") || media.url.includes(".mp4?tag=12") || media.url.includes("/tweet_video/")));
    if (!video?.url) {
      return { id, is_photo: true, status: 200, short_url: `https://x.com/i/status/${id}` };
    }
    const video_url = video.url;
    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default twitterApi;