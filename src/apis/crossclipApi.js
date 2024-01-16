import { randUA } from "@ahmedrangel/rand-user-agent";

class crossclipApi {
  constructor (crossclip_token) {
    this.crossclip_token = crossclip_token;
    this.base = "https://api-crossclip.streamlabs.com";
    this._userAgent = randUA("desktop");
  }

  async getKickClip (id) {
    try {
      const response = await fetch(`${this.base}/v1/imports/kick-clip/${id}`, {
        headers: {
          "User-Agent": this._userAgent,
          "Authorization": "Bearer " + this.crossclip_token
        },
      });
      const data = await response.json();
      console.log(data);
      return data.url;
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}

export default crossclipApi;