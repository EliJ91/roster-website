# Environment Variables Configuration

This document explains the environment variables setup for this application.

## Multiple .env Files

This project uses multiple .env files for different environments:

1. `.env.local` - Local development overrides (not committed to git)
2. `.env.development` - Development environment defaults
3. `.env.production` - Production environment defaults
4. `.env` - Shared environment variables (fallback)

## Priority Order

Variables are loaded in this order, with later ones taking precedence:
1. `.env`
2. `.env.development` or `.env.production` (depending on NODE_ENV)
3. `.env.local`
4. `.env.development.local` or `.env.production.local` (depending on NODE_ENV)

## Moving to Server Settings

Many configuration values that were previously stored in .env files are now managed through the Server Settings UI:

- Discord Guild ID
- Elevated Role ID
- Roles list
- Weapons by role
- Armor options

Only authentication-related variables still need to be in .env files:

```
# React App (Frontend) ENV
REACT_APP_DISCORD_CLIENT_ID=your_client_id
REACT_APP_DISCORD_REDIRECT_URI=http://localhost:8888  # or your production URL

# Netlify Functions (Backend) ENV
DISCORD_CLIENT_ID=your_client_id
DISCORD_CLIENT_SECRET=your_client_secret
DISCORD_REDIRECT_URI=http://localhost:8888  # or your production URL
DISCORD_BOT_TOKEN=your_bot_token
```

## Netlify Deployment

When deploying to Netlify:

1. Environment variables should be set in the Netlify dashboard (Site settings → Build & deploy → Environment variables)
2. Production values will be used based on NODE_ENV=production

## Local Development

For local development:
1. Create a `.env.local` file with your development credentials
2. These will override the default values in `.env.development`

## Transitioning from .env to Server Settings

The first time the Server Settings page loads, it will:
1. Try to load settings from the serverSettings collection in Firestore
2. If not found, fall back to .env variables
3. After saving in the UI, settings will be stored in the database instead of .env files

This approach allows for a smooth transition from configuration via .env files to configuration via the admin UI.
