# Sample server

Here you can see an example of how to build a configurable cors server in NodeJS with Express.

## Before you begin

Here are a few questions youshould consider:

- Why are you adding support for cross-origin requests?
- Are you adding CORS support to a new service or an existing server?
- Which clients should have access to the site?
- What devices/browsers will they be accessing the site from?
- Which HTTP methods and headers will your server support?
- Should the API support user-specific data? If so, will cookies be used to authenti-cate the user?

## Setting the Access-Control-Allow-Origin header

| Validation technique | Description                                                                | Pros                                                                                                                                                                                                  | Cons                                                                                     |
| -------------------- | :------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------- |
| Whitelist            | Maintains a list of valid origins                                          | Clearly indicates which ori-gins are allowedWorks well for small lists of origins                                                                                                                     | Difficult to maintain as the list grows larger                                           |
| Regular expression   | Writes a regular expression that matches all the valid origins             | Works well for a range of ori-gins that follow a pattern                                                                                                                                              | Need to verify that the reg-ular expression doesn’t accidentally match an invalid origin |
| Database query       | Stores the list of valid origins in a database                             | Provides a central location for storing origin informationWorks well for a large num-ber of origins without any common patternGood for maintaining a con-sistent CORS policy across different servers | Database calls can be slow (may need a caching layer to speed up things)                 |
| Blacklist            | The opposite of a whitelist: maintains a list of origins that aren’t valid | Easier to maintain if you’d like to allow all but a few origins                                                                                                                                       | Easy for clients to bypass (just pick a new origin that isn’t in the blacklist)          |

Steps of the validation:

1. Grab the value from the Origin header.
2. Validate the origin value using your chosen technique.
3. If the origin is valid, set the Access-Control-Allow-Origin header.

## CORS and proxy servers

One side effect of validating origins against a whitelist is that the value of the Access-Control-Allow-Origin header can vary between requests. For example, a request from the origin `http://localhost:1111` will return the header `Access-Control-Allow-Origin: http://localhost:1111`, but a request from `http://localhost:2222` to the same server will return the header `Access-Control-Allow-Origin: http://localhost:2222`. These different response headers from the same servers can sometimes cause caching issues. If your server can return different Access-Control-Allow-Origin headers to different clients, you should also set the Vary HTTP response header to Origin, like so:

`Vary: Origin`

Example where this might be a problem:

Bob is using his mobile and visits `http://mobile.espn.com`, while Alice is using her tablet and visits `http://tablet.espn.com`. Because both Alice and Bob are at work, their requests flow through the company’s proxy server.

When Alice makes the first request to `http://tablet.espn.com`, the tablet site makes a CORS request to load the scores from `http://api.espn.com`. The API responds with the header `Access-Control-Allow-Origin: http://tablet.espn.com`, and the proxy server caches the response.

Next, Bob makes his request to `http://mobile.espn.com`, and the mobile site grabs the scores from the same API. The proxy server notices that the request is to the same server that the tablet requested, and so it returns the cached response. Unfortunately, the cached response has the `Access-Control-Allow-Origin: http://tablet.espn.com` header set. This header causes a request from `http://mobile.espn.com` to fail, because the Origin header doesn’t match the Access-Control-Allow-Origin header.

Luckily, there is a way to fix this. The Vary header tells the proxy server that the Origin header should be taken into account when deciding whether or not to send cached content. With the `Vary: Origin` header in place, the proxy server will treat a request with `Origin: http://mobile.espn.com` differently from a request with `Origin: http://tablet.espn.com`.

_NOTE:_ CORS isn't security

```bash
curl -H "Origin: somerandomsite.com" http://127.0.0.1:9999/api/posts
```
