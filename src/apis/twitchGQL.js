import { $fetch } from "ofetch";
import { withQuery } from "ufo";

class twitchGQL {

  constructor () {
    this.baseURL = "https://gql.twitch.tv/gql";
  }

  async getClip (id) {
    const query = [
      {
        operationName: "ShareClipRenderStatus",
        variables: { slug: id },
        extensions: {
          persistedQuery: {
            version: 1,
            sha256Hash: "f130048a462a0ac86bb54d653c968c514e9ab9ca94db52368c1179e97b0f16eb"
          }
        }
      }
    ];

    const data = await $fetch(this.baseURL, {
      method: "POST",
      headers: { "Client-Id": "kimne78kx3ncx6brgo4mv6wki5h1ko" },
      body: query
    }).catch((e) => console.log(e));

    if (!data) return null;

    const clipData = data[0].data.clip;
    const caption = clipData?.title;
    const sig = clipData?.playbackAccessToken.signature;
    const token = clipData?.playbackAccessToken.value;
    const video_url = withQuery(clipData?.videoQualities[0].sourceURL, { sig, token });
    const short_url = clipData?.url;

    return { id, video_url, short_url, caption, status: 200 };
  }
}

export default twitchGQL;