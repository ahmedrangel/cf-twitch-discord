class JsResponse extends Response {
  constructor (body, opt) {
    body = body || {};
    const options = {
      headers: {
        "Content-Type": "text/javascript;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH",
        "Cache-Control": opt?.cache
      }
    };
    body?.status ? options.status = body.status : null;
    super(body, options);
  }
}

export default JsResponse;