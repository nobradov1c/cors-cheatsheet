# Making CORS request

JavaScript code can make HTTP requests with the XMLHttpRequest object.

## XMLHttpRequest object

```javascript
const xhr = new XMLHttpRequest();
if (!("withCredentials" in xhr)) {
  alert("Browser does not support CORS.");
  return;
}

// asynchronous request (default)
xhr.open(method, url);
// xhr.open(method, url, true);

// synchronous request
// xhr.open('GET','http://',false)

xhr.timeout = 1000;

xhr.setRequestHeader("X-Requested-With", "CORS in Action");

xhr.onerror = function () {
  alert("There was an error.");
};

xhr.onload = function () {
  const data = JSON.parse(xhr.responseText);
  alert(data.message);
};

xhr.send("request body goes here");
```

## XMLHttpRequest events

| Event       | Description                                                                              |
| ----------- | :--------------------------------------------------------------------------------------- |
| onloadstart | Fires when the request starts.                                                           |
| onprogress  | Fires when sending and loading data.                                                     |
| onabort     | Fires when the request has been aborted by calling the `abort` method.                   |
| onerror     | Fires when the request has failed.                                                       |
| onload      | Fires when the request has successfully completed.                                       |
| ontimeout   | Fires when the timeout has been exceeded (if the client code specified a timeout value). |
| onloadend   | Fires when the request has completed, regardless of whether there was an error or not.   |

### Upload events

```javascript
function uploadFile(file) {
  const xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload", true);
  xhr.upload.onprogress = function (e) {
    console.log("Upload progress: ", (e.loaded / e.total) * 100);
  };
  xhr.send(file);
}
```

## XMLHttpRequest response properties

| Response property | Description                                                                                                                                                                                    |
| ----------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| status            | The HTTP status code (for example, 200 for a successful request).                                                                                                                              |
| statusText        | The response string returned by the server (for example, `OK` for a successful request).                                                                                                       |
| response          | The body of the response, in the format defined by `responseType`. If the client indicated that the response type is `json`, the response will be a JSON object parsed from the response body. |
| responseText      | The body of the response as a string. Can only be used if `responseType` was not set or was set as `text`.                                                                                     |
| responseXML       | The body of the response as a DOM element (XML is here for historical reasons). Can only be used if `responseType` was not set or was set as `document`.                                       |

## Response Headers

The `getResponseHeader` and `getAllResponseHeaders` methods can be used to read theHTTP headers on the response.

By default, CORS only allows the client code to read the following response headers:

- Cache-Control
- Content-Language
- Content-Type
- Expires
- Last-Modified
- Pragma

If the server sets any additional response headers that aren’t in this list, the clientwon’t be able to see them. But the server can also override this behavior by specificallyindicating that these additional response headers should be visible to the client code.

## Cookies

Cookies can be included on cross-origin requests by setting the `XMLHttpRequest`’s `withCredentials` property to `true`. Setting the `withCredentials` property to `true` indi-cates that user credentials such as cookies, basic authentication information, or client-side Secure Sockets Layer (SSL) certificates should be included on cross-origin requests. The following code snippet shows an example of setting the `withCredentials` propertyto `true`:

```
xhr.withCredentials = true;
```

If you were to run this code in a web browser, it would fail because setting the `withCredentials` property to `true` isn’t enough to complete the request. The server must also indicate that it allows cookies for the request to succeed.

- NOTE: The `withCredentials` property doesn’t work with synchronous requests.

## List of headers that can't be set by setRequestHeader:

- Accept-Charset
- Accept-Encoding
- Access-Control-Request-Headers
- Access-Control-Request-Method
- Connection
- Content-Length
- Cookie
- Cookie2
- Date
- DNT
- Expect
- Host
- Keep-Alive
- Origin
- Referer
- TE
- Trailer
- Transfer-Encoding
- Upgrade
- User-Agent
- Via
- Proxy-\*
- Sec-\*

These headers have special meaning and can only be set by the browser. There is no error if the code tries to set the header. The value is just ignored.

The server has to give its permission for the client to include custom request headerson a cross-origin request. This behavior is unique to cross-origin requests.
