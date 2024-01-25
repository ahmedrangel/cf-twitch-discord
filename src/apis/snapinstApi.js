import { randUA } from "@ahmedrangel/rand-user-agent";

class snapinstApi {
  constructor () {
    this.domain = "https://snapinst.com/api/convert";
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
      for (const key of data.url) {
        if (type === "video" && key?.type === "mp4") {
          const snapUrl = new URL(key?.url);
          const igUrl = key.url = snapUrl.searchParams.get("uri");
          const filename = key.url = snapUrl.searchParams.get("filename");
          data.dl = igUrl;
          console.log(data.meta.title, filename);
          data.meta.title = url.includes("stories") ? null : data?.meta?.title;
          return data;
        }
      }
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default snapinstApi;