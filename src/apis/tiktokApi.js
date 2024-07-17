import { withQuery } from "ufo";
import { $fetch } from "ofetch";
import { defaultRetry } from "../utils/helpers";


class tiktokApi {
  constructor () {
    this.base = "https://tikwm.com/api/";
  }

  async getMedia (url) {
    const querystring = { url };
    const data = await $fetch(withQuery(this.base, querystring), { ...defaultRetry }).catch((e) => console.log(e), null);
    return data;
  }
}

export default tiktokApi;