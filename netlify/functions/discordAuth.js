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
    console.log("DISCORD_CLIENT_SECRET:", process.env.DISCORD_CLIENT_SECRET);
    console.log("DISCORD_REDIRECT_URI:", process.env.DISCORD_REDIRECT_URI);

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

    // Fetch user info
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

    // Fetch guild member info (roles)
    const GUILD_ID = process.env.DISCORD_GUILD_ID; // Add this to your env
    const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN; // Add this to your env
    let guildRoles = [];
    let isElevated = false;
    let guildName = null;
    if (GUILD_ID && BOT_TOKEN) {
      const guildMemberResponse = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}/members/${user.id}`, {
        headers: {
          Authorization: `Bot ${BOT_TOKEN}`,
        },
      });
      if (guildMemberResponse.ok) {
        const guildMember = await guildMemberResponse.json();
        console.log('--- RAW GUILD MEMBER RESPONSE ---');
        console.log(guildMember);
        guildRoles = guildMember.roles || [];
        // Fetch guild info for name
        const guildResponse = await fetch(`https://discord.com/api/v10/guilds/${GUILD_ID}`, {
          headers: {
            Authorization: `Bot ${BOT_TOKEN}`,
          },
        });
        if (guildResponse.ok) {
          const guild = await guildResponse.json();
          guildName = guild.name;
        }
        // Check for elevated role
        const elevatedRoleId = process.env.ELEVATED_ROLE_ID || process.env.REACT_APP_ELEVATED_ROLE_ID;
        const hasRole = elevatedRoleId && guildRoles.includes(elevatedRoleId);
        isElevated = !!hasRole;
        console.log('--- DISCORD AUTH DEBUG ---');
        console.log(`User: ${user.username}#${user.discriminator} (${user.id})`);
        console.log(`Guild (server) name: ${guildName ? guildName : '[NOT FOUND]'} | Guild ID: ${GUILD_ID}`);
        console.log(`User roles in guild:`, guildRoles);
        console.log(`Elevated role required: ${elevatedRoleId}`);
        if (hasRole) {
          console.log('%cUser IS elevated in this guild.', 'color: green; font-weight: bold');
        } else {
          console.log('%cUser is NOT elevated in this guild.', 'color: red; font-weight: bold');
        }
        console.log('--------------------------');
      } else {
        const errorText = await guildMemberResponse.text();
        console.error('Failed to fetch guild member:', guildMemberResponse.status, errorText);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, user: { ...user, guildRoles } }),
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
