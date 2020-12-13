function isPreflight(req) {
  const isHttpOptions = req.method === "OPTIONS";
  const hasOriginHeader = req.headers["origin"];
  const hasRequestMethod = req.headers["access-control-request-method"];
  return isHttpOptions && hasOriginHeader && hasRequestMethod;
}

const cors = function (options) {
  return function (req, res, next) {
    if (options.allowOrigin) {
      const origin = req.headers["origin"];
      if (options.allowOrigin(origin)) {
        res.set("Access-Control-Allow-Origin", origin);
      } else if (options.shortCircuit) {
        res.status(403).end();
        return;
      }
      res.set("Vary", "Origin");
    } else {
      res.set("Access-Control-Allow-Origin", "*");
    }
    if (options.allowCredentials === true) {
      res.set("Access-Control-Allow-Credentials", "true");
    }
    if (isPreflight(req)) {
      if (options.allowMethods) {
        res.set("Access-Control-Allow-Methods", options.allowMethods.join(","));
      }
      if (typeof options.allowHeaders === "function") {
        const headers = options.allowHeaders(req);
        if (headers) {
          res.set("Access-Control-Allow-Headers", headers);
        }
      } else if (options.allowHeaders) {
        res.set("Access-Control-Allow-Headers", options.allowHeaders.join(","));
      }
      if (options.maxAge) {
        res.set("Access-Control-Max-Age", options.maxAge);
      }
      res.status(204).end();
      return;
    } else if (options.exposeHeaders) {
      res.set("Access-Control-Expose-Headers", options.exposeHeaders.join(","));
    }
    next();
  };
};

module.exports = cors;
