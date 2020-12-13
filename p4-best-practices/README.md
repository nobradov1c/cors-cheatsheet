# Best practices

## Security

CORS isn't security!

```bash
curl -H "Origin: somerandomsite.com" http://127.0.0.1:9999/api/posts
```

## Including cookies on requests

Cookies aren’t included on CORS requests by default, but they can be enabled by setting the Access-Control-Allow-Credentials header to `true`. If you’re thinking about enabling cookies on your API, you should really consider whether you need cookie support. Cookies make requests harder to debug, and expose a new attack vector. So if you don’t need cookies, don’t enable them.

## CSRF

Security is very difficult to get right. If you need CSRF protection on CORS requests, here are a few things to keep in mind:

- _Consider whether you need CSRF protection._ CSRF protection is only needed if you are requesting protected data that includes the cookie.
- _Validate the Origin header._ This is a good form of CSRF protection, and it may be sufficient for your needs. While tools such as curl can spoof the Origin header, spoofing along with the cookie is harder (curl wouldn’t have access to the cookie).
- _Consider same-origin requests instead._ If you have a particular feature that requires CSRF protection, such as posting a new weblog, consider making it a same-origin feature instead. Same origin requests have proven mechanisms for protecting against CSRF. Part of using CORS successfully is understanding its limits, and you may save yourself a headache or two by using same-origin requests in this particular case.
- _Use something other than a cookie to validate the user._ If you’re building a public API, or need to provide authorized access to all origins, an authorization mechanism like OAuth2 might be a better fit for your needs.

## Handling preflight requests

A preflight request can be a performance hit, because it requires two HTTP requests. This can especially be an issue on resource-constrained systems, like mobile phones. Therefore, it’s useful to try to limit the number of preflight requests a client has to make.

- Maximizing the preflight cache
- Changing your site to reduce preflight requests (reduce non-simple requests)
