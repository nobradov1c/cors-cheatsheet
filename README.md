# CORS cheatsheet

All about cors.

This cheatsheet is inspired by the book "CORS in Action" by Monsu Hossain

## Introducing CORS

CORS - cross origin resource sharing

CORS is a way of making HTTP requests from one place to another. This is a trivial thing in other programming languages, but not so much in client-side JavaScript. This cheatsheet makes it a bit easier.

- [making CORS request](/p1-making-cors-request)
- [handling CORS request](https://link)
  - [handling preflight request]()
- [best practices](https://link)

## Lifecycle of a CORS request

1. The client initiates the request.
2. The  browser  adds  additional  information  to  the  request  and  forwards  it  tothe server.
3. The  server  decides  how  to  respond  to  the  request,  and  sends  the  response  tothe browser.
4. The browser decides whether the client should have access to the response, andeither passes the response to the client or returns an error.
