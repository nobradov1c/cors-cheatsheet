# CORS cheatsheet

All about cors.

This cheatsheet is inspired by the book "CORS in Action" by Monsu Hossain

## Introducing CORS

CORS - cross origin resource sharing

CORS is a way of making HTTP requests from one place to another. This is a trivial thing in other programming languages, but not so much in client-side JavaScript. This cheatsheet makes it a bit easier.

- [making CORS request](/p1-making-cors-request)
  - [xmlhttprequest object](/p1-making-cors-request#xmlhttprequest-object)
  - [xmlhttprequest events](/p1-making-cors-request#xmlhttprequest-events)
  - [xmlhttprequest response properties](/p1-making-cors-request#xmlhttprequest-response-properties)
  - [response headers](/p1-making-cors-request#response-headers)
  - [cookies](/p1-making-cors-request#cookies)
  - [List of headers that can't be set by setRequestHeader](/p1-making-cors-request#list-of-headers-that-cant-be-set-by-setrequestheader)
- [handling CORS request](/p2-handling-cors-request)
  - [the access-control-allow-origin header](/p2-handling-cors-request#the-access-control-allow-origin-header)
  - [handling preflight requests](/p2-handling-cors-request#handling-preflight-requests)
  - [cookies](/p2-handling-cors-request#cookies)
  - [exposing response headers to the client](/p2-handling-cors-request#exposing-response-headers-to-the-client)
  - [redirects](/p2-handling-cors-request#redirects)
  - [debugging](/p2-handling-cors-request#debugging)
- [sample server](/p3-sample-server)

  > `npm i`

  > `npm start`

- [best practices](/p4-best-practices)
  - [security](/p4-best-practices#security)
  - [cookies](/p4-best-practices#cookies)
  - [csrf](/p4-best-practices#csrf)
  - [handling preflight request](/p4-best-practices#handling-preflight-requests)

## Lifecycle of a CORS request

1. The client initiates the request.
2. The browser adds additional information to the request and forwards it to the server.
3. The server decides how to respond to the request, and sends the response to the browser.
4. The browser decides whether the client should have access to the response, and either passes the response to the client or returns an error.
