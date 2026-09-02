# Magic deck tracker

Helps you to record your results and look at the current meta.

A data wipe may happen sometimes, we are in alpha at the moment.

## Features

- Archetypes table can be filtered by time window: all time, last 4 weeks, or last 4 months.
- New match dialog now guides result entry more clearly, prevents incomplete submissions, and supports mirror matches.
- Built-in multilingual support with `vue-i18n`, English fallback, and runtime language switch (EN/IT).

## Internationalization

- Locales are defined in [src/i18n/locales/en.json](src/i18n/locales/en.json) and [src/i18n/locales/it.json](src/i18n/locales/it.json).
- i18n is initialized in [src/i18n/index.ts](src/i18n/index.ts) with:
	- `fallbackLocale: 'en'`
	- browser locale detection (`it` -> Italian, otherwise English)
	- persisted user selection in `localStorage` (`locale` key)
- The app installs i18n in [src/main.ts](src/main.ts).
- To add new UI text, always add keys in `en.json` first, then add the corresponding `it.json` translation.

## Development

When you update supabase types, run an update to align again:

```sh
npm run update-types
```
