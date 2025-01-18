import { Buffer } from "buffer";

class spotifyApi {

  constructor (spotify_client_id, spotify_client_secret) {
    this.spotify_client_id = spotify_client_id;
    this.spotify_client_secret = spotify_client_secret;
    this.grant_type = "authorization_code";
  }

  async GetCurrentUser (user_access_token) {
    const url = "https://api.spotify.com/v1/me";
    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user_access_token
      }
    });
    return data;
  }

  async OauthCallback (query_code, redirect_uri) {
    const oauth_url = `https://accounts.spotify.com/api/token?&code=${query_code}&grant_type=${this.grant_type}&redirect_uri=${redirect_uri}`;
    const response = await fetch(oauth_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + (new Buffer(this.spotify_client_id + ":" + this.spotify_client_secret).toString("base64"))
      }
    });
    return response;
  }

  async RefreshToken (refresh_token) {
    const oauth_url = `https://accounts.spotify.com/api/token?&grant_type=refresh_token&refresh_token=${refresh_token}`;
    const response = await fetch(oauth_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": "Basic " + (new Buffer(this.spotify_client_id + ":" + this.spotify_client_secret).toString("base64"))
      }
    });
    const { access_token } = await response.json();
    return access_token;
  }

  async GetCurrentlyPlayingTrack (user_access_token) {
    const url = "https://api.spotify.com/v1/me/player/currently-playing";
    const data = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + user_access_token
      }
    });
    return data;
  }
}
export default spotifyApi;