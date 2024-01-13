import { randUA } from "@ahmedrangel/rand-user-agent";
import { obtenerIDDesdeURL } from "../utils/helpers";

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
      if (type === "video" && data?.url[0]?.type === "mp4") {
        const url = new URL(data?.url[0]?.url);
        const igUrl = data.url[0].url = url.searchParams.get("uri");
        const filename = obtenerIDDesdeURL(igUrl) + ".mp4";
        data.meta.title = filename === data?.meta?.title ? null : data?.meta?.title;
        return data;
      }
      return null;
    } catch (e) {
      return null;
    }
  }
}

export default snapinstApi;