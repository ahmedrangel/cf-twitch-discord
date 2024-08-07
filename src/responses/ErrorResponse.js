class ErrorResponse extends Response {
  constructor (status, body, opt) {
    body = body || {};
    body.status = status;
    const options = {
      status,
      headers: {
        "Content-Type": "application/json;charset=UTF-8",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH",
        "Cache-Control": opt?.cache
      }
    };
    super(JSON.stringify(body), options);
  }
}

export default ErrorResponse;