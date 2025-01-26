import { EmbedBuilder, Client, TextChannel } from 'discord.js';
import ping from 'ping';
import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../monitorConfig.json');

let offline = false;
let offlineStart: number | null = null;

function loadConfig(): Record<string, any> {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export async function checkConnectivityEmbed(client: Client): Promise<void> {
  const result = await ping.promise.probe('google.com');

  const config = loadConfig();

  if (result.alive && offline && offlineStart !== null) {
    const now = Date.now();
    const downtimeSec = ((now - offlineStart) / 1000).toFixed(2);
    const lostTimeString = new Date(offlineStart).toLocaleString();
    const restoredTimeString = new Date(now).toLocaleString();

    offline = false;
    offlineStart = null;

    const restoredEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('Internet Connection Restored!')
      .addFields(
        { name: 'Went Offline At', value: lostTimeString },
        { name: 'Came Back At', value: restoredTimeString },
        { name: 'Downtime (seconds)', value: downtimeSec }
      )
      .setTimestamp();

    await sendConnectivityUpdate(client, restoredEmbed, config);
  } else if (!result.alive && !offline) {
    offline = true;
    offlineStart = Date.now();
    const lostTimeString = new Date(offlineStart).toLocaleString();

    const lostEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('Internet Connection Lost!')
      .addFields({ name: 'Lost At', value: lostTimeString })
      .setTimestamp();

    await sendConnectivityUpdate(client, lostEmbed, config);
  }
}

async function sendConnectivityUpdate(client: Client, embed: EmbedBuilder, config: Record<string, any>) {
  for (const [guildId, guildConfig] of Object.entries(config)) {
    if (guildConfig.connectivityMonitoring && guildConfig.connectivityMonitoring.enabled) {
      const channelId = guildConfig.systemMonitoring.channelId;
      if (!channelId) {
        console.warn(`No monitoring channel set for guild ${guildId}. Skipping connectivity update.`);
        continue;
      }

      try {
        const guild = await client.guilds.fetch(guildId);
        const channel = (await guild.channels.fetch(channelId)) as TextChannel;

        if (channel) {
          await channel.send({ embeds: [embed] });
        } else {
          console.warn(`Channel ID ${channelId} not found for guild ${guildId}.`);
        }
      } catch (error) {
        console.error(`Failed to send connectivity update to guild ${guildId}:`, error);
      }
    }
  }
}
