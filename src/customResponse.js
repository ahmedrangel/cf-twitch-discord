class CustomResponse extends Response {
  constructor (body, opt) {
    const options = {
      headers: {
        "Content-Type": opt?.type,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH",
        "Cache-Control": opt?.cache
      }
    };
    super(body, options);
  }
}

export default CustomResponse;