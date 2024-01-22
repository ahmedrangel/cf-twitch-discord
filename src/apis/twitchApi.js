class twitchApi {

  constructor(client_id, client_secret, database) {
    this.client_id = client_id;
    this.client_secret = client_secret;
    console.log(this.client_secret);
    this.grant_type = "client_credentials";
    this.database = database;
    this.API_BASE = "https://api.twitch.tv/helix";
    this.OAUTH_BASE = "https://id.twitch.tv/oauth2";
  }

  async getAccessToken() {
    const oauth_url = `${this.OAUTH_BASE}/token`;
    const response = await fetch(oauth_url, {
      body: JSON.stringify(this),
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    const { access_token } = await response.json();
    return access_token;
  }

  async getUsername (user_id) {
    try {
      const accessToken = await this.getAccessToken();
      const api = `${this.API_BASE}/users?id=${user_id}`;
      const headers = {
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + accessToken
      };

      if(!accessToken) {
        console.log("No Token");
        return null;
      } else {
        const response = await fetch(api, {method: "GET", headers: headers});
        const body = await response.json();
        return body.data[0].display_name;
      };
    } catch (e) {
      return false;
    }
  }

  async getId (name) {
    const decodedName = decodeURIComponent(name);
    const database = await this.database.prepare(`SELECT * FROM twitch WHERE login = '${decodedName.toLowerCase()}'`).first();
    if (!database) {
      try {
        const accessToken = await this.getAccessToken();
        const api = `${this.API_BASE}/users?login=${decodedName.toLowerCase()}`;
        const headers = {
          "Client-ID": this.client_id,
          "Authorization": "Bearer " + accessToken
        };

        if(!accessToken) {
          console.log("No Token");
          return null;
        } else {
          const response = await fetch(api, {method: "GET", headers: headers});
          const { data } = await response.json();
          await this.database.prepare(`INSERT OR REPLACE INTO twitch (id, display_name, login, avatar) VALUES ('${data[0].id}', '${data[0].display_name}', '${data[0].login}', '${data[0].profile_image_url.replace("https://static-cdn.jtvnw.net/","")}')`).first();
          return data[0].id;
        };
      } catch (e) {
        return null;
      }
    }
    return database.id;
  }

  async getUserByName (name) {
    const decodedName = decodeURIComponent(name);
    const database = await this.database.prepare(`SELECT * FROM twitch WHERE login = '${decodedName.toLowerCase()}'`).first();
    if (!database) {
      try {
        const accessToken = await this.getAccessToken();
        const api = `${this.API_BASE}/users?login=${decodedName.toLowerCase()}`;
        const headers = {
          "Client-ID": this.client_id,
          "Authorization": "Bearer " + accessToken
        };

        if(!accessToken) {
          console.log("No Token");
          return null;
        } else {
          const response = await fetch(api, {method: "GET", headers: headers});
          const { data } = await response.json();
          await this.database.prepare(`INSERT OR REPLACE INTO twitch (id, display_name, login, avatar) VALUES ('${data[0].id}', '${data[0].display_name}', '${data[0].login}', '${data[0].profile_image_url.replace("https://static-cdn.jtvnw.net/","")}')`).first();
          return data[0];
        };
      } catch (e) {
        return null;
      }
    }
    return database;
  }

  async getBroadcasterInfo(channel_id) {
    const accessToken = await this.getAccessToken();
    const api = `${this.API_BASE}/channels?broadcaster_id=${channel_id}`;
    const headers = {
      "Client-ID": this.client_id,
      "Authorization": "Bearer " + accessToken
    };

    if(!accessToken) {
      console.log("No Token");
      return null;
    } else {
      const response = await fetch(api, {method: "GET", headers: headers});
      const body = await response.json();
      return body.data[0];
    };
  }
  // user oauth call back for getting user access token, require oauth query code, require redirect uri
  async OauthCallback(query_code, redirect_uri) {
    const oauth_url = `${this.OAUTH_BASE}/token?client_id=${this.client_id}&client_secret=${this.client_secret}&code=${query_code}&grant_type=authorization_code&redirect_uri=${redirect_uri}`;
    const response = await fetch(oauth_url, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      }
    });
    return response;
  }

  // token validation
  async Validate(user_access_token) {
    const validate = `${this.OAUTH_BASE}/validate`;
    const validation = await fetch(validate, {
      method: "GET",
      headers: {
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token
      }
    });
    return validation;
  }

  // refresh user access token
  async RefreshToken (refresh_token) {
    const oauth_url = `${this.OAUTH_BASE}/token`;
    const response = await fetch(oauth_url, {
      body: `grant_type=refresh_token&refresh_token=${refresh_token}&client_id=${this.client_id}&client_secret=${this.client_secret}`,
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
    const { access_token } = await response.json();
    return access_token;
  }

  // Get Bits Leaderboard, require user access token
  async getBitsLeaderBoard (user_access_token) {
    const api = `${this.API_BASE}/bits/leaderboard?count=20&period=all`;
    const top_users = await fetch(api, {
      method: "GET",
      headers: {
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token
      }});
    const { data } = await top_users.json();
    return data;

  }

  // Set Stream Tags, require user access token, tags must be an array
  async SetTags (user_access_token, channelID, tags) {
    const api = `${this.API_BASE}/channels?broadcaster_id=${channelID}`;
    const set_tags = await fetch(api, {
      method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ tags: tags })
    });
    return set_tags;
  }

  // Set Stream Moderator, require user access token
  async AddMod (user_access_token, channel_id, user_id) {
    const api = `${this.API_BASE}/moderation/moderators?broadcaster_id=${channel_id}&user_id=${user_id}`;
    const add_mod = await fetch(api, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token,
        "Content-Type": "application/json"
      }
    });
    return add_mod;
  }

  // Remove Stream Moderator, require user access token
  async UnMod (user_access_token, channel_id, user_id) {
    const api = `${this.API_BASE}/moderation/moderators?broadcaster_id=${channel_id}&user_id=${user_id}`;
    const unmod = await fetch(api, {
      method: "DELETE",
      headers: {
        "Accept": "application/json",
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token,
        "Content-Type": "application/json"
      }
    });
    return unmod;
  }

  // Get chatters as mod or broadcaster, require user access token
  async getChatters (user_access_token, channel_id, mod_id) {
    const api = `${this.API_BASE}/chat/chatters?broadcaster_id=${channel_id}&moderator_id=${mod_id}`;
    const response = await fetch(api, {
      method: "GET",
      headers: {
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token
      }});
    const { data } = await response.json();
    return data;

  }

  // Post shoutout, require user access token
  async ShoutOut (user_access_token, channel_id, to_channel_id) {
    const api = `${this.API_BASE}/chat/shoutouts?from_broadcaster_id=${channel_id}&to_broadcaster_id=${to_channel_id}&moderator_id=${channel_id}`;
    const shoutout = await fetch(api, {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Client-ID": this.client_id,
        "Authorization": "Bearer " + user_access_token,
        "Content-Type": "application/json"
      }
    });
    if (shoutout.status === 204) {
      return null;
    }
    return await shoutout.json();
  }

  // Get if someone follow a broadcaster (requires boradcaster oauth)
  async getChannelFollower (user_access_token, channel_id, user_id) {
    try {
      const api = `${this.API_BASE}/channels/followers?broadcaster_id=${channel_id}&user_id=${user_id}`;
      const response = await fetch(api, {
        method: "GET",
        headers: {
          "Client-ID": this.client_id,
          "Authorization": "Bearer " + user_access_token
        }});
      const { data, message } = await response.json();
      return data ? data[0] : { message };
    } catch (e) {
      return null;
    }
  }

  // Get Clips
  async getClips (clip_id) {
    const accessToken = await this.getAccessToken();
    const api = `${this.API_BASE}/clips?id=${clip_id}`;
    const headers = {
      "Client-ID": this.client_id,
      "Authorization": "Bearer " + accessToken
    };

    if(!accessToken) {
      console.log("No Token");
      return null;
    } else {
      const response = await fetch(api, {method: "GET", headers: headers});
      const data = await response.json();
      return data.data[0];
    };
  }
}

export default twitchApi;