import { randUA } from "@ahmedrangel/rand-user-agent";

class twitterApi {
  constructor(twitter_bearer_token, x_cookie) {
    this.twitter_bearer_token = twitter_bearer_token;
    this.x_cookie = x_cookie;
  }

  async getTweet(id) {
    const _userAgent = randUA("desktop");
    const graphql = "https://twitter.com/i/api/graphql/xOhkmRac04YFZmOzU9PJHg/TweetDetail";
    const apiURL = new URL(graphql);
    apiURL.searchParams.set("variables", JSON.stringify({
      focalTweetId: id,
      withRuxInjections: false,
      includePromotedContent: true,
      withCommunity: true,
      withQuickPromoteEligibilityTweetFields: true,
      withBirdwatchNotes: true,
      withVoice: true,
      withV2Timeline: true,
    }));
    apiURL.searchParams.set("features", JSON.stringify({
      rweb_lists_timeline_redesign_enabled: true,
      responsive_web_graphql_exclude_directive_enabled: true,
      verified_phone_label_enabled: false,
      creator_subscriptions_tweet_preview_api_enabled: true,
      responsive_web_graphql_timeline_navigation_enabled: true,
      responsive_web_graphql_skip_user_profile_image_extensions_enabled: false,
      tweetypie_unmention_optimization_enabled: true,
      responsive_web_edit_tweet_api_enabled: true,
      graphql_is_translatable_rweb_tweet_is_translatable_enabled: true,
      view_counts_everywhere_api_enabled: true,
      longform_notetweets_consumption_enabled: true,
      responsive_web_twitter_article_tweet_consumption_enabled: false,
      tweet_awards_web_tipping_enabled: false,
      freedom_of_speech_not_reach_fetch_enabled: true,
      standardized_nudges_misinfo: true,
      tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled: true,
      longform_notetweets_rich_text_read_enabled: true,
      longform_notetweets_inline_media_enabled: true,
      responsive_web_media_download_video_enabled: false,
      responsive_web_enhance_cards_enabled: false,
    }));
    apiURL.searchParams.set("fieldToggles", JSON.stringify({
      withArticleRichContentState: false,
    }));

    const response = await fetch(apiURL, {
      headers: {
        "cookie": this.x_cookie,
        "user-agent": _userAgent,
        ["sec-fetch-site"]: "same-origin",
        "Authorization": `Bearer ${this.twitter_bearer_token}`,
        "X-Twitter-Active-User": "yes",
        "X-Twitter-Auth-Type": "OAuth2Session",
        "X-Twitter-Client-Language": "en",
        "X-Csrf-Token": "0144e92ab3ad369187f2103484b8feec2d908204fdd66c97d891c468e07f7a57f2ced9f28b923d2e884f4854bf0d9b2accc07444d50a5d35b0e1afbb9bf563b926e5310e13dd28a34c098d6e3169a402"
      }
    });
    const data = await response.json();
    return data;
  }
}
export default twitterApi;