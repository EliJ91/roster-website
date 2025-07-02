# Environment Setup

### Discord Authentication

This app uses Discord OAuth2 for authentication. You'll need to set up proper environment variables for both development and production environments:

#### Development
Create a `.env` file in the root directory with:
```
REACT_APP_DISCORD_REDIRECT_URI=http://localhost:3000
REACT_APP_DISCORD_CLIENT_ID=YOUR_CLIENT_ID
DISCORD_CLIENT_SECRET=YOUR_CLIENT_SECRET
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
REACT_APP_GUILD_ID=YOUR_GUILD_ID
REACT_APP_ELEVATED_ROLE_ID=YOUR_ADMIN_ROLE_ID
REACT_APP_USER_ROLE_ID=YOUR_USER_ROLE_ID
REACT_APP_GUEST_ROLE_ID=YOUR_GUEST_ROLE_ID
```

#### Production
For production deployment on Netlify:
1. Set environment variables in the Netlify dashboard under Site settings > Build & deploy > Environment variables
2. Required variables:
   - DISCORD_REDIRECT_URI=https://yourdomain.com
   - REACT_APP_DISCORD_REDIRECT_URI=https://yourdomain.com
   - DISCORD_CLIENT_ID
   - DISCORD_CLIENT_SECRET
   - DISCORD_BOT_TOKEN
   - REACT_APP_GUILD_ID
   - REACT_APP_ELEVATED_ROLE_ID
   - REACT_APP_USER_ROLE_ID
   - REACT_APP_GUEST_ROLE_ID

3. Update your Discord Developer Portal OAuth2 settings:
   - Add your production URL as a redirect URI (e.g., `https://yourdomain.com`)

### Server Settings

The app uses a Firestore document to store server settings, including:
- Discord server ID and name
- Role IDs for admins, users, and guests
- Available roles for roster creation
- Weapons available for each role
- Armor options for character creation

You can manage these settings:

1. **Through the Admin UI**: Navigate to `/admin` and click "Server Settings" (requires admin access)
2. **Dev Uploader (Development Mode)**: In development mode, click the "?" icon in the top-left corner and use the Settings tab to upload a server-settings.json file

#### Default Server Settings

The `server-settings.json` file contains default server settings that can be:
- Used to initialize a new deployment
- Uploaded through the Dev Uploader
- Used as a reference for the structure of server settings

Example:
```json
{
  "guildId": "YOUR_DISCORD_SERVER_ID",
  "elevatedRoleId": "ADMIN_ROLE_ID",
  "userRoleId": "USER_ROLE_ID",
  "guestRoleId": "GUEST_ROLE_ID",
  "guildName": "Your Discord Server",
  "roles": ["Tank", "Healer", "DPS"],
  "weaponsByRole": {
    "Tank": ["Sword and Shield", "Warhammer"],
    "Healer": ["Life Staff", "Void Gauntlet"],
    "DPS": ["Bow", "Fire Staff", "Rapier"]
  },
  "armorOptions": {
    "head": ["Heavy Helm", "Medium Helm", "Light Hood"],
    "chest": ["Heavy Plate", "Medium Chest", "Light Chest"],
    "feet": ["Heavy Boots", "Medium Boots", "Light Shoes"]
  }
}
```

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
