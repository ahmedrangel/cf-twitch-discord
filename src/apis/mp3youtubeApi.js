import { randUA } from "@ahmedrangel/rand-user-agent";

class mp3youtubeApi {
  constructor () {
    this.base = "https://v3.mp3youtube.cc";
  }

  async getMedia (id, filter) {
    const _userAgent = randUA("desktop");
    const formData = new FormData();
    formData.append("link", `https://youtu.be/${id}`);
    formData.append("format", filter === "audio" ? "mp3" : "mp4");
    const response = await fetch(`${this.base}/api/converter`, {
      method: "POST",
      headers: {
        "User-Agent": _userAgent,
        "Referer": `${this.base}/download/${id}`,
      },
      body: formData
    });
    const data = await response.json();
    return data.url;
  }
}

export default mp3youtubeApi;