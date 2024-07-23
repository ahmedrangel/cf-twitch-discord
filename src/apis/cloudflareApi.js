class cloudflareApi {

  constructor (cf_account_id, cf_api_token) {
    this.cf_account_id = cf_account_id;
    this.cf_api_token = cf_api_token;
  }

  async getNamespaces () {
    const url = `https://api.cloudflare.com/client/v4/accounts/${this.cf_account_id}/storage/kv/namespaces`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + this.cf_api_token
    };
    const response = await fetch(url, { method: "GET", headers: headers });
    const body = await response.json();
    return body;
  }

  async getKeyValueList (ns_name) {
    const data = await this.getNamespaces();
    let size = Object.keys(data.result).length;
    for (let x = 0; x < size; x++) {
      if (ns_name == data.result[x].title) {
        const ns_id = data.result[x].id;
        const url = `https://api.cloudflare.com/client/v4/accounts/${this.cf_account_id}/storage/kv/namespaces/${ns_id}/keys`;
        const headers = {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + this.cf_api_token
        };
        const response = await fetch(url, { method: "GET", headers: headers });
        let keys = await response.json();
        keys = keys.result;
        let key_name_value = keys.map(keys => {
          const keys_names = keys.name;
          const values = keys.metadata.value;
          const data = ({ key: keys_names, value: values });
          return data;
        }).filter(keys => keys);
        key_name_value = key_name_value.sort((a, b) => {
          if (a.value > b.value) {
            return -1;
          }
        });
        return key_name_value;
      }
    }

  }

}

export default cloudflareApi;