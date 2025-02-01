---

# Quatrell, o Auditor

Quatrell, o Auditor is a simple Discord bot built with **Discord.JS** to automate tasks for the **Terra Sagrada** RPG Discord server.

## 🚀 Features

- Automated management of XP, bank transactions, and treasure tracking.
- Seamless integration with Firebase for data storage.
- Easy-to-use slash commands for a streamlined experience.

## 📌 Installation & Setup

Follow these steps to set up **Quatrell, o Auditor** on your Discord server.

### 1️⃣ Create Your Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application and generate a **bot token**.
3. If you're new to Discord bot development, check out the [Discord.JS Guide](https://discordjs.guide/) for more details.

### 2️⃣ Configure Environment Variables

After cloning the repository, create a `.env` file in the root directory with the following variables:

```env
# Discord Configuration
DISCORD_TOKEN=
DISCORD_CLIENT_ID=
DISCORD_GUILD_ID=

# Channel IDs
CHANNELS_BANK=
CHANNELS_XP=
CHANNELS_TREASURE=
CHANNELS_TRANSFERENCIES=
CHANNELS_GENERAL=

# Firebase Configuration
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGE_SENDER_ID=
FIREBASE_APP_ID=

# Firestore Collections
COLLECTIONS_USERS=
```

### 3️⃣ Install Dependencies

Run the following command to install the required dependencies:

```sh
npm install
```

### 4️⃣ Register Commands

To register the bot’s slash commands, execute:

```sh
npm run build
```

This will use the `deploy-commands.js` script to sync commands with your Discord guild.

### 5️⃣ Run the Bot

You can run the bot using one of the following methods:

- **Locally:**  
  ```sh
  npm run start
  ```
- **With PM2:** (For process management)  
  ```sh
  pm2 start bot.js --name "Quatrell"
  ```
- **On Cloud Services:** Deploy your bot to services like:
  - **Oracle Cloud**
  - **AWS**
  - **Railway**
  - **Any Node.js-compatible server**

## 📖 User Manual

For detailed instructions on using **Quatrell, o Auditor**, check out the official manual:  
📜 [Quatrell, o Auditor - Manual](https://homebrewery.naturalcrit.com/share/0rY0tSS9ir9H)

---