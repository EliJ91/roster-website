// netlify/functions/discordAuth.js
const fetch = require('node-fetch');

exports.handler = async function (event, context) {
  try {
    const { code } = JSON.parse(event.body);

    const params = new URLSearchParams();
    params.append('client_id', process.env.DISCORD_CLIENT_ID);
    params.append('client_secret', process.env.DISCORD_CLIENT_SECRET);
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.DISCORD_REDIRECT_URI);
    console.log("DISCORD_CLIENT_ID:", process.env.DISCORD_CLIENT_ID);

    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      body: params,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token error: ${errorText}`);
    }

    const tokenData = await tokenResponse.json();

    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`User fetch error: ${errorText}`);
    }

    const user = await userResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ user }),
    };
  } catch (err) {
    console.error("DISCORD AUTH ERROR:", err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: err.message }),
    };
  }
};
