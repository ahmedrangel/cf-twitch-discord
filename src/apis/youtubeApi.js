class youtubeApi {
  constructor(youtube_token) {
    this.youtube_token = youtube_token;
  }

  async getVideoInfo(id) {
    const url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet%2CcontentDetails&id=${id}&key=${this.youtube_token}`;
    const response = await fetch(url, {
      method: "GET",
    });
    const data = await response.json();
    return data;
  }
}
export default youtubeApi;