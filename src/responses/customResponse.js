class CustomResponse extends Response {
  constructor (body, opt) {
    body = body || {};
    const options = {
      headers: {
        "Content-Type": opt?.type,
        "Content-Disposition": opt?.disposition || "inline",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH",
        "Access-Control-Allow-Credentials": "true",
        "Cache-Control": opt?.cache,
        "etag": opt?.etag
      }
    };
    body?.status ? options.status = body.status : null;
    super(body, options);
  }
}

export default CustomResponse;