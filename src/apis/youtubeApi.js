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

  async getMedia (url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|live)\/|\S*?[?&]v=|shorts\/)?|youtu\.be\/)([a-zA-Z0-9_-]+)/;
    const match = url.match(regex);
    if (!match) return null;
    const id = match[1];
    const { items } = await this.getVideoInfo(id);
    const { snippet, contentDetails } = items[0];
    const duration = timeToSeconds(contentDetails.duration);
    const short_url = "https://youtu.be/" + id;
    const ytsave = new ytsavetubeApi();
    const y2mate = new y2mateApi();
    const ytproxy = new ytproxyApi();
    const video_url = await ytproxy.getVideo(url) || await ytsave.getVideo(id) || await y2mate.getVideo(id);
    if (!video_url) return null;
    return {
      id,
      video_url,
      short_url,
      caption: snippet.title,
      duration,
      status: 200
    };
  }
}
export default youtubeApi;