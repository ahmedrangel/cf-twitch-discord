import { $fetch } from "ofetch";
import scrape from "media-scraper/x";
import { userAgent } from "../utils/helpers";

class twitterApi {
  constructor (twitter_bearer_token, x_cookie) {
    this.twitter_bearer_token = twitter_bearer_token;
    this.x_cookie = x_cookie;
  }

  async getTweet (url) {
    const vxtwitter = "api.vxtwitter.com" ;
    url = url.replace(/twitter\.com|x\.com/, vxtwitter);
    const data = await $fetch(url, { headers: { "User-Agent": userAgent } }).catch(() => null);
    if (!data) return null;
    const { tweetID, text, media_extended } = data;
    if (!media_extended?.length) return null;
    const id = tweetID;
    const caption = text?.replace(/https:\/\/t\.co\/\w+/g, "").trim();
    const short_url = `https://x.com/i/status/${id}`;
    const video = media_extended.find(media => (media.type === "video" && (media.url.includes("avc1") || media.url.includes("/pu/vid/") || media.url.includes(".mp4?tag=12") || media.url.includes("/tweet_video/"))) || media.type === "gif");
    if (!video?.url) {
      return { id, short_url, is_photo: true, status: 200 };
    }
    const video_url = video.url;
    console.log("Retrieving video from VxTwitter API");
    return {
      status: 200,
      id,
      video_url,
      short_url,
      caption,
      owner: {
        name: data?.user_name,
        username: data?.user_screen_name,
        avatar_url: data?.user_profile_image_url,
        url: data?.user_screen_name ? `https://x.com/${data.user_screen_name}` : undefined
      }
    };
  }

  async getTweetGraphql (url) {
    const data = await scrape(url).catch(() => null);
    if (!data) return null;
    console.log("Retrieving video from Twitter GraphQL API");
    const match = url.match(/status\/(\d+)(?:\/video\/(\d+))?/);
    const videoIndex = match && match[2] ? Number(match[2]) - 1 : 0;
    const mediaType = data.media?.[videoIndex]?.type;
    const quotedMediaType = data.quoted?.media?.[videoIndex]?.type;
    if (mediaType === "photo" && quotedMediaType === "photo" || mediaType === "photo" && !quotedMediaType) {
      return { id: data.id, short_url: `https://x.com/i/status/${data.id}`, is_photo: true, status: 200 };
    }
    const mediaVideos = data.media?.[videoIndex]?.video_versions?.filter(media => (media.url.includes("avc1") || media.url.includes("/pu/vid/") || media.url.includes(".mp4?tag=12") || media.url.includes("/tweet_video/")));
    const quotedMediaVideos = data.quoted?.media?.[videoIndex]?.video_versions?.filter(media => (media.url.includes("avc1") || media.url.includes("/pu/vid/") || media.url.includes(".mp4?tag=12") || media.url.includes("/tweet_video/")));
    const maxBitrateMedia = Math.max(...(mediaVideos?.map(media => media.bitrate || 0) || [0]));
    const maxBitrateQuotedMedia = Math.max(...(quotedMediaVideos?.map(media => media.bitrate || 0) || [0]));
    const video = mediaVideos?.find(media => media.bitrate === maxBitrateMedia) || quotedMediaVideos?.find(media => media.bitrate === maxBitrateQuotedMedia);
    if (!video?.url) return null;

    return {
      status: 200,
      id: data.id,
      video_url: video.url,
      short_url: `https://x.com/i/status/${data.id}`,
      caption: data.caption,
      owner: {
        name: data?.author?.name,
        username: data?.author?.username,
        avatar_url: data?.author?.avatar_url,
        url: data?.author?.username ? `https://x.com/${data.author.username}` : undefined
      }
    };
  }

  async getMedia (url) {
    if (url.includes("twitter.com/") || url.includes("x.com/") || url.includes("t.co/")) {
      const tco = url.includes("t.co/") ? (await $fetch(url, { headers: { "User-Agent": randUA("desktop") } }).catch(() => null)).match(/location\.replace\("([^"]+)"\)/)[1] : null;
      const fixedUrl = tco ? tco.replace(/\\/g, "") : url;
      const result = (await this.getTweetGraphql(fixedUrl)) || (await this.getTweet(fixedUrl));
      if (result) return result;
      return null;
    }
    return null;
  }
}

export default twitterApi;