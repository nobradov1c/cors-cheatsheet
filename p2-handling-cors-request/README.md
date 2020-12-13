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

_NOTE:_ The CORS spec uses the term user credentials to describe any bits of information the browser sets on a request to identify the user. This includes cookies, basic HTTP authentication, and client-side SSL. While the techniques described in this section apply to all of these types of user credentials, the text will focus only on cookies to keep things simple.

Reading the cookies on the server:

```javascript
const username = req.cookies["username"];
```

_NOTE:_ You may also have to use a middleware for parsing cookies. In NodeJS, you can do so by running npm install cookie-parser.

Like all other CORS features, the server uses an HTTP response header to define cookie behavior. But unlike other CORS features, there is a client-side component to cookie support. Cookies will only work when both the client and the server are in agreement.

Server side:

The server indicates that it can receive cookies on CORS requests by setting the Access-Control-Allow-Credentials response header. Setting that header to true means that the server allows cookies on the CORS request.

If the request includes a preflight request, the Access-Control-Allow-Credentials header must be present on both the preflight and the actual request. But the cookie will only be sent on the actual request; the preflight request will never have a cookie.

Client side:

In addition to setting a server-side response header, you have to set a property in the client’s JavaScript code to include the cookie with the request.

```javascript
xhr.withCredentials = true;
```

### Cookies on the client

JavaScript’s `document.cookie` property allows programmatic access to a site’s cookies. Using `document.cookie`, JavaScript code can read and write the value of a cookie, as shown in the following code snippet. You can print the value of the cookie to the console using

`console.log(document.cookie);`

and you can set the cookie value using

`document.cookie = 'newcookie=1';`

But the preceding code will not work with cross-origin cookies. The `document.cookie` property can’t read or write the value from another origin. Calling `document.cookie` from the client will return only the client’s own cookies, not the cross-origin cookies.

This is because cookies themselves have a same-origin policy similar to the same-origin policy for HTTP requests. Each cookie has a path and a domain, and only pages from that path and domain can read the cookie. So while the cookie is included in the CORS request, the browser still honors the cookie’s same-origin policy, and keeps the cookie hidden from client code.

### Cookies when there is no preflight request

Based on the previous discussion, you may think that if a server doesn’t want cookies, all it needs to do is omit the Access-Control-Allow-Credentials header. However this isn’t quite true. Cookies may still be sent to the server in the case where the request doesn’t have a preflight.

If the client has `withCredentials` set to `true`, and there isn’t a preflight, the cookie will be sent to the server. This is because the browser has no way of predicting what the value of the Access-Control-Allow-Credentials header will be before sending the actual request. When the browser sees that the Access-Control-Allow-Credentials header isn’t set, it will throw an error in the client. But because the client set the `withCredentials` property, the cookie was already sent to the server in the request.

There is a whole class of attacks that can arise from this request-plus-cookie combination called cross-site request forgery (CSRF), and CORS isn’t immune to them. Therefore, standard security precautions such asCSRF prevention should be used when making CORS requests.

### User credentials and access-control-allow-origin

If the Access-Control-Allow-Credentials header is set to `true`, the \* value can’t be used in the Access-Control-Allow-Origin header.

### Setting the cookie from CORS

The rules described in this section also apply to setting the cookie from the server. If the `withCredentials` property and Access-Control-Allow-Credentials header are both `true`, the server can set a cookie on the client. This cookie still can’t be read from JavaScript code, but it will be included on subsequent requests to the server.

## Exposing response headers to the client

The `XMLHttpRequest` object exposes two methods for reading the response headers: `getResponseHeader` and `getAllResponseHeaders`. Same-origin requests can use these methods to read headers from the response. But cross-origin requests have limitations on which response headers can be viewed by the client. By default, only a few response headers are visible to clients on cross-origin requests. These are called simple headers and they are:

- Cache-Control
- Content-Language
- Content-Type
- Expires
- Last-Modified
- Pragma

The server needs to specify that it’s okay for the client to read the X-Powered-By header. The server does this by using the Access-Control-Expose-Headers header. TheAccess-Control-Expose-Headers header contains a list of headers that the client code can read.

```javascript
res.set("Access-Control-Expose-Headers", "X-Powered-By, Timezone-Offset");
```

The Access-Control-Expose-Headers header ensures that the client code can only read the response headers intended by the server.

## Redirects

```javascript
serverapp.get("/api/posts", function (req, res) {
  res.redirect(301, "/api/v2/posts");
});

serverapp.get("/api/v2/posts", function (req, res) {
  res.json(POSTS);
});
```

- Simple CORS requests will follow redirects.
- Preflight requests will not follow redirects.
- If the redirect is to the same server as the original request, the Origin header will stay the same. Otherwise, the Origin header will be set to null.

## Debugging

Regardless of what tools you use to solve the issue, the steps to solving CORS errorsare the same:

1. Capture a snapshot of the request and response headers.
2. Compare the headers to see if and where there is a mismatch
3. Fix the issue by either
   - Updating the client to send the correct headers
   - Updating the server to allow the client headers

### Tools for debugging

- Browser's developer tools
  - Console
  - Network monitor
- Wireshark (monitor network traffic)
- curl (to simulate CORS request)
  - ```bash
    curl curl http://www.example.com
    ```
  - ```bash
    curl --verbose -H "Origin: http://localhost:1111" http://127.0.0.1:9999/api/posts
    ```
  - ```bash
    # preflight request
    curl --verbose -H "Origin: null" -H "Access-Control-Request-Method: GET" -X OPTIONS http://127.0.0.1:9999/api/posts
    ```
  - _TIP:_ From browser's developer tools you can copy request as cURL
