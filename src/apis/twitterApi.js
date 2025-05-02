import { $fetch } from "ofetch";
import { ClientTransaction } from "@lami/x-client-transaction-id";
import { parseHTML } from "linkedom";
import { userAgent } from "../utils/helpers";

class twitterApi {
  constructor (twitter_bearer_token, x_cookie) {
    this.twitter_bearer_token = twitter_bearer_token;
    this.x_cookie = x_cookie;
  }

  async getTweet (url) {
    const vxtwitter = "api.vxtwitter.com" ;
    url = url.replace(/twitter\.com|x\.com/, vxtwitter);
    const data = await $fetch(url, { headers: { "User-Agent": userAgent } }).catch(() => null);
    if (!data) return null;
    const { tweetID, text, media_extended } = data;
    if (!media_extended?.length) return null;
    const id = tweetID;
    const caption = text?.replace(/https:\/\/t\.co\/\w+/g, "").trim();
    const short_url = `https://x.com/i/status/${id}`;
    const video = media_extended.find(media => media.type === "video" && (media.url.includes("avc1") || media.url.includes("/pu/vid/") || media.url.includes(".mp4?tag=12") || media.url.includes("/tweet_video/")));
    if (!video?.url) {
      return { id, is_photo: true, status: 200, short_url };
    }
    const video_url = video.url;
    console.log("Retrieving video from VxTwitter API");
    return { id, video_url, short_url, caption, status: 200 };
  }

  async getTweetGraphql (url) {
    try {
      const html = await $fetch("https://x.com", {
        headers: {
          "Authority": "x.com",
          "Cache-Control": "no-cache",
          "cookie": this.x_cookie,
          "user-agent": userAgent,
          "sec-fetch-site": "same-origin",
          "Accept": "*/*",
          "Referer": "https://x.com/",
          "X-Twitter-Active-User": "yes",
          "X-Twitter-Client-Language": "en"
        },
        responseType: "text"
      });
      const dom = parseHTML(html);
      const document = dom.window.document;
      const transaction = new ClientTransaction(document);
      await transaction.initialize();
      const graphqlPath = "/i/api/graphql/e7RKseIxLu7HgkWNKZ6qnw/TweetDetail";
      const transactionId = await transaction.generateTransactionId("GET", graphqlPath);
      const regex = /status\/(\d+)(?:\/video\/(\d+))?/;
      const match = url.match(regex);
      const id = match ? match[1] : null;
      const videoNumber = match && match[2] ? Number(match[2]) - 1 : 0;
      const variables = { focalTweetId: id, with_rux_injections: false, includePromotedContent: true, withCommunity: true, withQuickPromoteEligibilityTweetFields: true, withBirdwatchNotes: true, withVoice: true, withV2Timeline: true };
      const features = { rweb_tipjar_consumption_enabled: true, responsive_web_graphql_exclude_directive_enabled: true, verified_phone_label_enabled: false, creator_subscriptions_tweet_preview_api_enabled: true, responsive_web_graphql_timeline_navigation_enabled: true, responsive_web_graphql_skip_user_profile_image_extensions_enabled: false, communities_web_enable_tweet_community_results_fetch: true, c9s_tweet_anatomy_moderator_badge_enabled: true, articles_preview_enabled: true, tweetypie_unmention_optimization_enabled: true, responsive_web_edit_tweet_api_enabled: true, graphql_is_translatable_rweb_tweet_is_translatable_enabled: true, view_counts_everywhere_api_enabled: true, longform_notetweets_consumption_enabled: true, responsive_web_twitter_article_tweet_consumption_enabled: true, tweet_awards_web_tipping_enabled: false, creator_subscriptions_quote_tweet_preview_enabled: false, freedom_of_speech_not_reach_fetch_enabled: true, standardized_nudges_misinfo: true, tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true, rweb_video_timestamps_enabled: true, longform_notetweets_rich_text_read_enabled: true, longform_notetweets_inline_media_enabled: true, responsive_web_enhance_cards_enabled: false };
      const { data } = await $fetch(`https://x.com${graphqlPath}`, {
        query: { variables, features },
        headers: {
          "sec-fetch-site": "same-origin",
          "Authorization": `Bearer ${this.twitter_bearer_token}`,
          "Cookie": this.x_cookie,
          "User-Agent": userAgent,
          "X-Twitter-Active-User": "yes",
          "X-Twitter-Auth-Type": "OAuth2Session",
          "X-Twitter-Client-Language": "en",
          "X-Client-Transaction-Id": transactionId,
          "X-Client-Uuid": "255acf8c-2354-472b-90f5-69b4a6751939",
          "X-Csrf-Token": "334134b5a792413c07a7e60e81e5061ca3fd297b55c626e03aa5c0ca67757d4bd4baeb0855ddc3ed1c56bebb8dfd2c9f91c1f11c2c9fbdc416de21cd3d5d448142110c14da8d6a0760f5450f61880718"
        }
      });
      const dataEntries = data?.threaded_conversation_with_injections_v2?.instructions.find(instruction => instruction.type === "TimelineAddEntries")?.entries;
      const entriesArr = [];
      const quotedArr = [];

      for (const en of dataEntries) {
        if (en?.entryId === `tweet-${id}`) {
          const result = en?.content?.itemContent?.tweet_results?.result;
          entriesArr.push(result?.legacy || result?.tweet?.legacy);
          quotedArr.push(result?.quoted_status_result?.result?.legacy || result?.quoted_status_result?.result?.tweet?.legacy);
          break;
        }
      }

      const entries = entriesArr[0];
      const quotedEntries = quotedArr.length ? quotedArr[0] : null;
      if (!entries && !quotedEntries) return null;
      if (entries?.extended_entities?.media[videoNumber]?.type === "photo" || quotedEntries?.extended_entities?.media[videoNumber]?.type === "photo")
        return { id, is_photo: true, status: 200, short_url: `https://x.com/x/status/${id}` };

      if (!entries?.extended_entities?.media[videoNumber]?.video_info && !quotedEntries?.extended_entities?.media[videoNumber]?.video_info) return null;
      const videos = entries?.extended_entities?.media[videoNumber]?.video_info?.variants || quotedEntries?.extended_entities?.media[videoNumber]?.video_info?.variants;
      const filteredVideos = videos.filter(video => video.content_type === "video/mp4" && (video.url.includes("avc1") || video.url.includes("/pu/vid/") || video.url.includes(".mp4?tag=12") || video.url.includes("/tweet_video/")));
      const maxBitrate = Math.max(...filteredVideos.map(video => video.bitrate));
      const video = filteredVideos.find(video => video.bitrate === maxBitrate);

      const video_url = video?.url;
      const short_url = `https://x.com/i/status/${id}`;
      const caption = entries?.full_text?.replace(/https:\/\/t\.co\/\w+/g, "").trim();
      console.log("Retrieving video from GraphQL API");
      return { id, video_url, short_url, caption, status: 200 };
    } catch (error) {
      console.info(error);
      return null;
    }
  }
}

export default twitterApi;