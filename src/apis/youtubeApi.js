import { $fetch } from "ofetch";
import { timeToSeconds } from "../utils/helpers";
import y2mateApi from "./y2mateApi";
import ytproxyApi from "./ytproxyApi";
import ytsavetubeApi from "./ytsavetube";

class youtubeApi {
  constructor (youtube_token) {
    this.youtube_token = youtube_token;
  }

  async getVideoInfo (id) {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${id}&key=${this.youtube_token}`;
    const data = await $fetch(url);
    return data;
  }

  async getChannelInfo (id) {
    const url = `https://youtube.googleapis.com/youtube/v3/channels?part=snippet&id=${id}&key=${this.youtube_token}`;
    const data = await $fetch(url);
    return data;
  }

  async getMedia (url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live)\/|\S*?[?&]v=|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (!match) return null;
    const id = match[1];
    const { items } = await this.getVideoInfo(id);
    const { snippet, contentDetails } = items[0];
    const channelInfo = (await this.getChannelInfo(snippet.channelId))?.[0];
    const duration = timeToSeconds(contentDetails.duration);
    const short_url = "https://youtu.be/" + id;
    const ytsave = new ytsavetubeApi();
    const y2mate = new y2mateApi();
    const ytproxy = new ytproxyApi();
    const video_url = await ytproxy.getVideo(url) || await ytsave.getVideo(id) || await y2mate.getVideo(id);
    if (!video_url) return null;
    return {
      status: 200,
      id,
      video_url,
      short_url,
      caption: snippet.title,
      duration,
      owner: {
        name: channelInfo?.snippet?.title,
        username: channelInfo?.snippet?.customUrl,
        avatar_url: channelInfo?.snippet?.thumbnails?.default?.url,
        url: channelInfo?.snippet?.customUrl ? `https://www.youtube.com/${channelInfo.snippet.customUrl}` : channelInfo?.id ? `https://www.youtube.com/channel/${channelInfo.id}` : undefined
      }
    };
  }
}
export default youtubeApi;