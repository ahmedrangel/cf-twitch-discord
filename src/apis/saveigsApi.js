import { randUA } from "@ahmedrangel/rand-user-agent";

class saveigsApi {
  constructor () {
    this.domain = "https://saveigs.com/wp-json/aio-dl/video-data";
  }

  async getMedia (url, type) {
    try {
      const _userAgent = randUA("desktop");
      const formData = new FormData();
      formData.append("url", url);
      const response = await fetch(this.domain, {
        method: "POST",
        headers: {
          "User-Agent": _userAgent
        },
        body: formData
      });
      const data = await response.json();
      const filtered = (extensions) => {
        data.medias = data.medias.filter(media => extensions.includes(media.extension));
        return data;
      };
      if (type === "audio") return filtered(["m4a", "mp3", "webm"]);
      else if (type === "video") return filtered(["mp4"]);
      else if (type === "image") return filtered(["jpg"]);
      return data;
    } catch (e) {
      return null;
    }
  }
}

export default saveigsApi;