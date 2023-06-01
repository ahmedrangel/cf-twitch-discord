class imgurApi {

    constructor(imgur_client_id, imgur_client_secret) {
      this.imgur_client_id =  imgur_client_id,
      this.imgur_client_secret = imgur_client_secret,
      this.grant_type_code = "authorization_code"
      this.grant_type_refresh = "refresh_token"
    }

    async OauthCallback(code) {
        const oauth_url = `https://api.imgur.com/oauth2/token`;
        const data = await fetch(oauth_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `client_id=${this.imgur_client_id}&client_secret=${this.imgur_client_secret}&grant_type=${this.grant_type_code}&code=${code}`
        });
        const response = await data.json();
        console.log(response);
        return await response;
    }

    async RefreshToken(refresh_token) {
        const oauth_url = `https://api.imgur.com/oauth2/token`;
        const data = await fetch(oauth_url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `client_id=${this.imgur_client_id}&client_secret=${this.imgur_client_secret}&grant_type=${this.grant_type_refresh}&refresh_token=${refresh_token}`
        });
        const response = await data.json();
        console.log(response);
        return await response;
    }

    async UploadImage(access_token, title, image_url_o_b64) {
        const description_IA = "This is an image generated by AI DALL-E"
        const oauth_url = `https://api.imgur.com/3/image`;
        const data = await fetch(oauth_url, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + access_token,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `title=${title}&description=${description_IA}&image=${encodeURIComponent(image_url_o_b64)}`
        });
        const response = await data.json();
        return await response; 
    }

    async PostToCommunity(access_token, title, imageHash){
        console.log(title);
        const url = `https://api.imgur.com/3/gallery/image/${imageHash}`;
        const data = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + access_token
            },
            body: `title=${title}`
        });
        return await data.json(); 
    }

    async GetMyGallery(access_token){
        const url = `https://api.imgur.com/3/account/me/images`;
        const data = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + access_token
            },
        });
        return await data.json(); 
    }
}

export default imgurApi;