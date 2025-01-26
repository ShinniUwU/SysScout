# SysScout

![SysScout Banner](https://i.imgur.com/AfFp7pu.png) <!-- Replace with your actual banner image URL -->

**SysScout** is a robust Discord bot designed to monitor and display real-time system metrics directly within your Discord servers. Whether you're managing a gaming community, a development team, or any group that requires system oversight, SysScout provides an intuitive and seamless way to keep track of CPU usage, memory consumption, disk space, and internet connectivity—all from within Discord.

## Table of Contents

- [Features](#features)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Running the Bot](#running-the-bot)
- [Commands](#commands)
- [Configuration File](#configuration-file)
- [Permissions](#permissions)
- [License](#license)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Acknowledgements](#acknowledgements)

## Features

- **System Monitoring**: Track CPU, Memory, Swap, and Disk usage with visual progress bars.
- **Internet Connectivity Alerts**: Receive notifications when internet connectivity is lost or restored.
- **Customizable Channels**: Designate specific channels for system and connectivity updates.
- **Persistent Configuration**: Settings are saved and restored automatically across bot restarts.
- **Interactive Commands**: Easily start, stop, and manage monitoring through intuitive slash commands.
- **Real-Time Updates**: Embed messages are updated in real-time based on your monitoring intervals.

## Getting Started

Follow these instructions to set up and run SysScout in your own Discord server.

### Prerequisites

Before installing SysScout, ensure you have the following:

- **Node.js**: Version 16.6.0 or higher. [Download Node.js](https://nodejs.org/)
- **Bun**: A fast JavaScript runtime. [Install Bun](https://bun.sh/)
- **Discord Account**: To create a bot and add it to your server.
- **Permissions**: Administrator access to the Discord server where you want to add the bot.

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/ShinniUWU/SysScout.git
   cd SysScout
   ```

2. **Install Dependencies**

   Ensure you have Bun installed. Then, install the necessary packages:

   ```bash
   bun install
   ```

### Configuration

1. **Create a Discord Bot**

   - Go to the [Discord Developer Portal](https://discord.com/developers/applications).
   - Click on **New Application** and name it **SysScout**.
   - Navigate to the **Bot** section and click **Add Bot**.
   - Under **Token**, click **Copy** to save your bot token. **Keep this token secure!**

2. **Invite the Bot to Your Server**

   - In the Developer Portal, go to the **OAuth2** section.
   - Under **URL Generator**, select the following scopes and permissions:
     - **Scopes**: `bot`, `applications.commands`
     - **Bot Permissions**:
       - `Send Messages`
       - `Embed Links`
       - `Manage Messages` (optional, for editing messages)
       - `Read Message History`
   - Copy the generated URL and paste it into your browser to invite the bot to your desired server.

3. **Set Up Configuration File**

   Create a `.env` file in the root directory with the following content:

   ```env
   TOKEN=YOUR_DISCORD_BOT_TOKEN
   CLIENT_ID=YOUR_BOT_CLIENT_ID
   ```

   - Replace `YOUR_DISCORD_BOT_TOKEN` with the token you copied earlier.
   - Replace `YOUR_BOT_CLIENT_ID` with your bot's client ID found in the Developer Portal.

### Running the Bot

Start the bot using Bun:

```bash
bun run src/index.ts
```

Upon successful launch, you should see logs indicating that the bot has logged in and registered its commands.

## Commands

SysScout utilizes Discord's slash commands for ease of use. Below are the available commands:

### `/startmonitor`

**Description**: Starts monitoring system metrics in the current channel.

**Options**:

- `interval` (required): How often in minutes the system will update the information.
- `selfedit` (optional): Whether to update the same message (`true`/`false`, `enable`/`disable`).

**Usage**:

```
/startmonitor interval:5 selfedit:true
```

**Behavior**:

- Sends an embed message displaying system metrics every specified interval.
- If `selfedit` is enabled, the same message is edited with updated metrics.
- If `selfedit` is disabled, new messages are sent each time.

### `/status`

**Description**: Shows the current system status and resets the monitoring interval if running.

**Usage**:

```
/status
```

**Behavior**:

- Displays the latest system metrics.
- If monitoring is active, it edits the existing embed or sends a new one based on the `selfedit` setting.

### `/setconnectivitychannel`

**Description**: Sets the channel for internet connectivity updates.

**Options**:

- `channel` (required): The text channel where connectivity updates will be posted.

**Usage**:

```
/setconnectivitychannel channel:#connectivity-updates
```

**Behavior**:

- Assigns the specified channel to receive internet connectivity alerts (e.g., when connectivity is lost or restored).

## Configuration File

SysScout uses a `monitorConfig.json` file to persist settings across restarts. Below is an example structure:

```json
{
  "1227786471759675462": {
    "systemMonitoring": {
      "channelId": "1302714333775790100",
      "intervalMs": 60000,
      "selfEdit": true,
      "lastMessageId": "1333116298737225738"
    },
    "connectivityMonitoring": {
      "enabled": true,
      "channelId": "1302714333775790100"
    }
  }
}
```

- **GUILD_ID_X**: Replace with your actual guild (server) IDs.
- **systemMonitoring**:
  - `channelId`: ID of the channel where system metrics are posted.
  - `intervalMs`: Monitoring interval in milliseconds.
  - `selfEdit`: Boolean indicating if the bot should edit the same message.
  - `lastMessageId`: ID of the last message sent by the bot (used for editing).
- **connectivityMonitoring**:
  - `enabled`: Boolean indicating if connectivity monitoring is active.
  - `channelId`: ID of the channel for connectivity updates.

> **Note**: Do not manually edit `monitorConfig.json` while the bot is running to prevent data inconsistencies.

## Permissions

Ensure SysScout has the following permissions in your Discord server:

- **Send Messages**: To post system metrics and connectivity updates.
- **Embed Links**: To send rich embed messages.
- **Manage Messages** *(optional)*: If `selfEdit` is enabled, to edit existing messages.
- **Read Message History**: To fetch and edit previous messages.

## License

SysScout is licensed under the [MIT License](LICENSE) with the [Commons Clause](LICENSE).

**Summary**:
- **Permitted**: Use, copy, modify, merge, publish, distribute, sublicense the software.
- **Not Permitted**: Selling, leasing, sublicensing, or otherwise commercializing the software.

By using SysScout, you agree not to commercialize it in any form.

### MIT License with Commons Clause

```markdown
MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

### Commons Clause

The Software is provided to you by the Licensor under the MIT License, as defined
below, subject to the following condition.

Without limiting other conditions in the MIT License, the grant of rights under the
MIT License will not include, and the Licensee agrees not to engage in, the sale,
resale, sublicensing, or otherwise commercializing of the Software.

For purposes of the above, “Sale” means selling, leasing, sublicensing,
or otherwise commercializing the Software.

Any license notice or attribution required by the MIT License must also include this
Commons Clause License Condition notice.
```

### Logging

SysScout outputs logs to the console for monitoring its operations. Keep the terminal open to view real-time logs and error messages.

## Contributing

Contributions are welcome! To contribute to SysScout, follow these steps:

1. **Fork the Repository**

   Click the **Fork** button at the top-right corner of the repository page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/yourusername/SysScout.git
   cd SysScout
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Your Changes**

   Implement your feature or fix the issue.

5. **Commit Your Changes**

   ```bash
   git commit -m "Add Your Feature Description"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request**

   Navigate to the original repository and click **New Pull Request**.

### Guidelines

- **Code Quality**: Ensure your code is clean, well-documented, and follows the existing code style.
- **Testing**: Test your changes thoroughly before submitting a pull request.
- **Documentation**: Update the README or other documentation if your changes affect usage.

## License

SysScout is licensed under the [MIT License](LICENSE) with the [Commons Clause](LICENSE).

**Summary**:
- **Permitted**: Use, copy, modify, merge, publish, distribute, sublicense the software.
- **Not Permitted**: Selling, leasing, sublicensing, or otherwise commercializing the software.

By using SysScout, you agree not to commercialize it in any form.

## Acknowledgements

- [Discord.js](https://discord.js.org/) - A powerful JavaScript library for interacting with the Discord API.
- [Systeminformation](https://systeminformation.io/) - A system and hardware information library.
- [Bun](https://bun.sh/) - A fast all-in-one JavaScript runtime.

