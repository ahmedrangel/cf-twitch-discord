import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";

class ytproxyApi {
  constructor () {}

  async getVideo (url) {
    const data = await $fetch("https://youtube-converter.ahmedrangel.com/720/download", {
      ...defaultRetry,
      query: { url }
    }).catch((e) => {
      console.log(e);
      return null;
    });
    return data?.url;
  }
}
export default ytproxyApi;