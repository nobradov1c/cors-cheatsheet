const express = require("express");
const cors = require("./middleware/cors");

const POSTS = {
  1: { post: "This is the first blog post." },
  2: { post: "This is the second blog post." },
  3: { post: "This is the third blog post." },
};

const createWhitelistValidator = function (whitelist) {
  return function (val) {
    for (let i = 0; i < whitelist.length; i++) {
      if (val === whitelist[i]) {
        return true;
      }
    }
    return false;
  };
};

// const createRegexpValidator = function (re) {
//   return function (origin) {
//     return re.test(origin);
//   };
// };

const originWhitelist = ["null", "http://localhost:1111"];

const corsOptions = {
  allowOrigin: createWhitelistValidator(originWhitelist),
  // allowOrigin: createRegexpValidator(/^http:\/\/localhost(:\d+)?$/i),
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

const SERVER_PORT = 9999;
const serverapp = express();
// serverapp.use(cookieParser());
serverapp.use(cors(corsOptions));

serverapp.get("/api/posts", function (req, res) {
  res.json(POSTS);
});

serverapp.listen(SERVER_PORT, function () {
  console.log("Started server at http://127.0.0.1:" + SERVER_PORT);
});

const CLIENT_PORT = 1111;
const clientapp = express();
clientapp.use(express.static(__dirname + "/public"));
clientapp.use(express.static(__dirname));
clientapp.listen(CLIENT_PORT, function () {
  console.log("Started client at http://localhost:" + CLIENT_PORT);
});
