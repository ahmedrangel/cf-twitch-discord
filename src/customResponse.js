class CustomResponse extends Response {
  constructor (body, opt) {
    const options = {
      headers: {
        "Content-Type": opt?.type,
        "Content-Disposition": opt?.disposition || "inline",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH",
        "Access-Control-Allow-Credentials": "true",
        "Cache-Control": opt?.cache
      }
    };
    super(body, options);
  }
}

export default CustomResponse;