# Magic deck tracker

Helps you to record your results and look at the current meta.

A data wipe may happen sometimes, we are in alpha at the moment.

## Supabase integration

### Identity

From supabase come many integration like twitch and others. To make integrations works correctly, you need to understand that this application interface directly to supabase and in supabase there are many services that need to callback first supabase before the application. For twitch, application invokes:

```js
await supabase.auth.linkIdentity({
    provider: provider.value,
    options: { redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT },
});
```

where *import.meta.env.VITE_SUPABASE_REDIRECT* is `https://*.ngrok-free.app` in local development. This invokes supabase function that call twitch sending the callback url declared in twitch provider provider in authentication section. Than supabase calls our application in the *VITE_SUPABASE_REDIRECT* url. In production, this var is equal to `https://magic-deck-tracker.com`.

### Database

Download datatypes using `npm run update-types`.

## Challonge integration

Create an account on [connect.challonge.com](https://connect.challonge.com) to create your app and integrate with it.

We currently have two Challonge applications, one for production and one for tests using ngrok.

When you want to integrate with Challonge, we send a request to challonge to get a code, than use the supabase function to get the access_token on the server and store it in the table. In this case, user doesn't know his access_token and always use Challonge proxy for further requests.

In your test challonge application, you have to set https://2d1152a8b211.ngrok-free.app/users/me/identities as OAuth URL to receive the code callback. Then you can call supabase function. Set VITE_CHALLONGE_REDIRECT_URI in the .env file.

1. Open ngrok
2. Get clientId and secretId from challonge
3. Set callback url in challonge to ngrok
4. Login to supabase from ngrok domain
5. Go to identities
6. Start

## Deploy

We use Terraform to manage our service infrastructure and supabase as backend.

1. Create with terraform the backend services
2. Deploy database, migrations and functions
3. Deploy frontend to github pages
