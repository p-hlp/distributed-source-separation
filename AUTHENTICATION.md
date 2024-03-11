# Authentication / Authorization

This application uses OAuth2.0 with PKCE as authorization code flow to secure the web-client and all endpoints.

## What is OAuth?

> OAuth 2.0 is the industry-standard protocol for authorization. OAuth 2.0 focuses on client developer simplicity while providing specific authorization flows for web applications, desktop applications, mobile phones, and living room devices. This specification and its extensions are being developed within the IETF OAuth Working Group.

See [specs](https://oauth.net/2/) for more information.

## PKCE (Proof Key Code Exchange)

PKCE is used for Single Page Applications (SPAs) to enhance security during the OAuth code flow, particularly because SPAs can't securely store secrets. It involves sending a hash of a secret code verifier from the client to the authorization server, ensuring that the token is only given to the client that initiated the request. The main difference between the normal OAuth Code flow and OAuth PKCE is that PKCE doesn't require the client to store a secret, making it more suitable for clients that cannot securely store secrets, such as mobile apps and SPAs.

For more detailed information see [this](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-pkce) Auth0 article explaining OAuth PKCE authorization code flow.

## How it works

![AuthorizationCodeFlow](docs/assets/auth-sequence-auth-code-pkce.png)

## What it means for this application

Once we acquired an access token from the Auth0 tenant and are logged in, we can start making requests against the backend.
The frontend intercepts every request made (using axios http interceptors) and injects the access / bearer token in the `authorization` header. This is a standard json web token. Auth0 library handles refreshing access tokens when they expire via. a simple request against the `/token` endpoint using the refresh token.

When the backend receives a request, it validates the included token against the Auth0 tenant and adds user information to the request for further use by the endpoints. This essentially scopes requests to a certain user and also is the only authorization needed. Whenever data is queried it will be done in that specific user context, so a user can only see their own data.
