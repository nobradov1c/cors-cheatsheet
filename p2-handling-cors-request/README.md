# Hadnling CORS request

Examples are written in NodeJS, but same concepts apply to any language.

## The Access-Control-Allow-Origin header

The server uses the Access-Control-Allow-Origin response header to approve therequest. This header must be present on every successful CORS response.

`Access-Control-Allow-Origin: *`

`Access-Control-Allow-Origin: http://localhost:1111`

`Access-Control-Allow-Origin: https://example.com`

## Handling preflight requests

The browser asks for permissions by using what is called a _preflight_ request. A preflight request is a small request that is sent by the browser before the actual request. It contains information like which `HTTP` method is used, as well as if any custom `HTTP` headers are present.

### Why does the preflight request exist?

The concept of a preflight was introduced to allow cross-origin requests to be made without breaking existing servers that depend on the browser’s same-origin policy. If the preflight hits a server that is CORS-enabled, the server knows what a preflight request is and can respond appropriately. But if the preflight hits a server that doesn’t know or doesn’t care about CORS, the server won’t send the correct preflight response, and the actual request will never be sent. The preflight protects unsuspecting servers from receiving cross-origin requests they may not want.

### When a preflight request is issued?

A preflight request is issued when a request meets any of the following criteria:

- It uses an HTTP method other than `GET`, `POST`, or `HEAD`
- It sets the Content-Type request header with values other than
  - application/x-www-form-urlencoded
  - multipart/form-data
  - text/plain
- It sets additional request headers that are not
  - Accept
  - Accept-Language
  - Content-Language
- The `XMLHttpRequest` contains upload events

Upload events

Before upload support in XMLHttpRequests existed, the traditional way of doing an upload was through a form. While the form would upload a file, it couldn’t provide additional information, such as how far the upload has progressed. The upload event introduces a functionality that wasn’t available before CORS; therefore it requires a preflight request.

```javascript
const xhr = new XMLHttpRequest();
xhr.open("POST", "/upload", true);
xhr.upload.onprogress = function (e) {
  console.log("Upload progress: ", (e.loaded / e.total) * 100);
};
xhr.send(file);
```

On the other hand, if you upload a file using XMLHttpRequest, but without using upload events, the request doesn’t need a preflight (again, this makes sense,because without upload events, the upload behaves the same as a form upload).

```javascript
const xhr = new XMLHttpRequest();
xhr.open("POST", "/upload", true);
xhr.send(file);
```

### Identifying a preflight request

- HTTP `OPTIONS` method
- Origin request header
- Access-Control-Request-Method header

```javascript
const isPreflight = function (req) {
  const isHttpOptions = req.method === "OPTIONS";
  const hasOriginHeader = req.headers["origin"];
  const hasRequestMethod = req.headers["access-control-request-method"];
  return isHttpOptions && hasOriginHeader && hasRequestMethod;
};

const handleCors = function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "http://localhost:1111");
  if (isPreflight(req)) {
    res.set("Access-Control-Allow-Methods", "GET, DELETE");
    console.log("Received a preflight request!");
    res.status(204).end();
    return;
  }
  next();
};
```

### Responding to a preflight request

- The HTTP response status should be in the 200 range.
- The response shouldn’t have a body.
- If a method is a simple method, it doesn’t need to be listed in the `Access-Control-Allow-Methods` header.
  - simple methods as `GET`, `POST`, and `HEAD`

Supporting request headers with Access-Control-Allow-Headers:

`Access-Control-Allow-Headers: Timezone-Offset, Sample-Source`

NOTE If the requested header is a simple header, it’s not required to be included in the Access-Control-Allow-Headers response header. But I recommend including simple headers to avoid confusion.

### Rejecting a preflight request

- Leave out the Access-Control-Allow-Origin header (if the requested method is not a simple method).
- Return a value in Access-Control-Allow-Methods that doesn’t match the Access-Control-Request-Method header.
- If the preflight request has an Access-Control-Request-Headers header:
  - Leave out the Access-Control-Allow-Headers header.
  - Return a value in the Access-Control-Allow-Headers header that doesn’t match the Access-Control-Request-Headers header.

_NOTE:_ Returning a non-200 HTTP response code as the preflight response will not reject the request in some browsers. It’s still a good idea to stick to the HTTP 200 or 204 statuscode, because it adheres to the spec, which won’t change.

_NOTE:_ Both the preflight response and the actual response need the Access-Control-Allow-Originheader.

### Preflight cache

One downside of the preflight request is that it issues two HTTP requests, one for the preflight and a second for the actual request. This can be a performance concern because HTTP requests are expensive, especially on resource-constrained devices like smartphones. To help reduce the number of preflight requests, preflight responses can be cached in a preflight result cache.

The `Access-Control-Max-Age` header indicates how long, in seconds, a response can stay in the cache.

```javascript
var handleCors = function (req, res, next) {
  res.set("Access-Control-Allow-Origin", "http://localhost:1111");
  if (isPreflight(req)) {
    res.set("Access-Control-Allow-Methods", "GET, DELETE");
    res.set("Access-Control-Allow-Headers", "Timezone-Offset, Sample-Source");
    res.set("Access-Control-Max-Age", "120");
    res.status(204).end();
    return;
  }
  next();
};
```

The `Access-Control-Max-Age` value is only a suggestion for how long an item should be cached. Browsers may cache for a shorter amount of time. Firefox doesn’t allow items to be cached for longer than 24 hours, while Chrome, Opera, and Safari cache items for a maximum of five minutes. If the Access-Control-Max-Age header isn’t specified, Firefox doesn’t cache the preflight, while Chrome, Opera, and Safari cache the preflight for five seconds.

## Cookies

