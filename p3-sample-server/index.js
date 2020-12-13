var createWhitelistValidator = function (whitelist) {
  return function (val) {
    for (var i = 0; i < whitelist.length; i++) {
      if (val === whitelist[i]) {
        return true;
      }
    }
    return false;
  };
};

// var createRegexpValidator = function (re) {
//   return function (origin) {
//     return re.test(origin);
//   };
// };

// var corsOptions = {
//   allowOrigin: createRegexpValidator(/^http:\/\/localhost(:\d+)?$/i),
// };

var originWhitelist = ["null", "http://localhost:1111"];

var corsOptions = {
  allowOrigin: createWhitelistValidator(originWhitelist),
  allowCredentials: false,
  shortCircuit: true,
  allowMethods: ["GET", "DELETE"],
  allowHeaders: ["Timezone-Offset", "Sample-Source"],
  // accept all headers
  // allowHeaders: function (req) {
  //   return req.headers["access-control-request-headers"];
  // },
  // allow  only  those  header  values  prefixedwith X-
  // allowHeaders: function (req) {
  //   var reqHeaders = req.headers["access-control-request-headers"];
  //   if (!reqHeaders) {
  //     return null;
  //   }
  //   reqHeaders = reqHeaders.split(",");
  //   resHeaders = [];
  //   for (var i = 0; i < reqHeaders.length; i++) {
  //     var header = reqHeaders[i].trim();
  //     if (header.toLowerCase().indexOf("x-") === 0) {
  //       resHeaders.push(header);
  //     }
  //   }
  //   return resHeaders.join(",");
  // },
  maxAge: 120,
  exposeHeaders: ["X-Powered-By"],
};

var handleCors = function (options) {
  return function (req, res, next) {
    if (options.allowOrigin) {
      var origin = req.headers["origin"];
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
        var headers = options.allowHeaders(req);
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
var SERVER_PORT = 9999;
var serverapp = express();
serverapp.use(cookieParser());
serverapp.use(express.static(__dirname));
serverapp.use(handleCors(corsOptions));
serverapp.get("/api/posts", function (req, res) {
  res.json(POSTS);
});
