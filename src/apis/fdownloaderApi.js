import { snapsave } from "snapsave-media-downloader";

class fdownloaderApi {
  constructor () {}

  async getMedia (link) {
    try {
      const { data } = await snapsave(link);
      if (!data) return null;
      return { status: 200, video_url: data?.media[0]?.url };
    } catch (e) {
      return null;
    }
  }
}

export default fdownloaderApi;