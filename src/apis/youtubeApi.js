import { $fetch } from "ofetch";

class youtubeApi {
  constructor(youtube_token) {
    this.youtube_token = youtube_token;
  }

  async getVideoInfo(id) {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${id}&key=${this.youtube_token}`;
    const data = await $fetch(url);
    return data;
  }
}
export default youtubeApi;