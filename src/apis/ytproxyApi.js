import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class ytproxyApi {
  constructor () {}

  async getVideo (url) {
    const data = await $fetch("https://youtube-converter.ahmedrangel.com/download", {
      method: "POST",
      ...defaultRetry,
      body: { url, quality: "720" }
    }).catch((e) => {
      console.log(e);
      return null;
    });
    return data?.url;
  }
}
export default ytproxyApi;