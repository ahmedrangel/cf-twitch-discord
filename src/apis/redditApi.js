import { load } from "cheerio";
import { $fetch } from "ofetch";
import { withQuery } from "ufo";

class redditApi {

  constructor () {
    this.baseURL = "https://savemp4.red/backend.php";
  }

  async getMedia (url) {
    const regex = /\/(?:comments\/|s\/)([a-zA-Z0-9]{7})/;
    const id = url.match(regex)[1];

    const data = await $fetch(withQuery(this.baseURL, { url })).catch(() => null);
    if (!data) return null;

    const $ = load(data);
    const video_url = $("source").attr("src");
    const caption = $(".card-title").text();
    const short_url = url.replace(/([&?](?!v=)[^=]+=[^&]*)/g, "").replace("&", "?").replace("www.", "");

    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default redditApi;