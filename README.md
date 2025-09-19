# Magic deck tracker

Helps you to record your results and look at the current meta.

A data wipe may happen sometimes, we are in alpha at the moment.

## Supabase integration

From supabase come many integration like twitch and others. To make integrations works correctly, you need to understand that this application interface directly to supabase and in supabase there are many services that need to callback first supabase before the application. For twitch, application invokes:

```js
await supabase.auth.linkIdentity({
    provider: provider.value,
    options: { redirectTo: import.meta.env.VITE_SUPABASE_REDIRECT },
});
```

where *import.meta.env.VITE_SUPABASE_REDIRECT* is `https://*.ngrok-free.app` in local development. This invokes supabase function that call twitch sending the callback url declared in twitch provider provider in authentication section. Than supabase calls our application in the *VITE_SUPABASE_REDIRECT* url. In production, this var is equal to `https://magic-deck-tracker.com`.

## Deploy

We use Terraform to manage our service infrastructure and supabase as backend.

1. Create with terraform the backend services
2. Deploy database, migrations and functions
3. Deploy frontend to github pages

## Challonge integration

Create an account on connect.challonge.com to create your app and integrate with it.

We currently have two Challonge applications, one for production and one for tests using ngrok.
