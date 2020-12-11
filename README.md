# CORS cheatsheet

All about cors.

This cheatsheet is inspired by the book "CORS in Action" by Monsu Hossain

## Introducing CORS

CORS - cross origin resource sharing

CORS is a way of making HTTP requests from one place to another. This is a trivial thing in other programming languages, but not so much in client-side JavaScript. This cheatsheet makes it a bit easier.

- [making CORS request](/p1-making-cors-request)
- [handling CORS request](/p2-handling-cors-request)
  <!-- - [handling preflight request]() -->
- [sample code - best practices](https://link)

## Lifecycle of a CORS request

1. The client initiates the request.
2. The  browser  adds  additional  information  to  the  request  and  forwards  it  to the server.
3. The  server  decides  how  to  respond  to  the  request,  and  sends  the  response  to the browser.
4. The browser decides whether the client should have access to the response, and either passes the response to the client or returns an error.
