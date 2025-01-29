import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags, Message, Client } from 'discord.js';
import { getSystemUsage } from '../utils/systemUsage';
import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../monitorConfig.json');

export const monitorState = {
  intervals: new Map<string, ReturnType<typeof setInterval>>(),
  lastMessages: new Map<string, Message | null>(),
};

export function loadConfig(): Record<string, any> {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

export function isConfigEmpty(config: Record<string, any>): boolean {
return Object.keys(config).length === 0;
}

export function saveConfig(config: Record<string, any>) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export const data = new SlashCommandBuilder()
  .setName('startmonitor')
  .setDescription('Starts monitoring of the system')
  .addStringOption((option) =>
    option
      .setName('interval')
      .setDescription('How often in minutes the system will update the information')
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName('selfedit')
      .setDescription('Whether to update the same message (true/false, enable/disable)')
      .setRequired(false)
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  const intervalInput = interaction.options.getString('interval', true);
  const intervalMinutes = parseFloat(intervalInput);
  const selfEditInput = interaction.options.getString('selfedit')?.toLowerCase();

  const selfEdit = selfEditInput === 'true' || selfEditInput === 'enable';

  if (isNaN(intervalMinutes) || intervalMinutes <= 0) {
    await interaction.reply({
      content: 'Please enter a valid number of minutes.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const channel = interaction.channel;
  if (!channel || !(channel instanceof TextChannel)) {
    await interaction.reply({
      content: 'Please use this command in a server text channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const intervalMs = intervalMinutes * 60 * 1000;
  const guildId = interaction.guildId!;

  const config = loadConfig();

  // Initialize guild config if it doesn't exist
  if (!config[guildId]) {
    config[guildId] = {
      systemMonitoring: {
        channelId: channel.id,
        intervalMs,
        selfEdit,
        lastMessageId: null // Initialize with null
      },
      connectivityMonitoring: {
        enabled: false
      }
    };
  } else {
    config[guildId].systemMonitoring = {
      channelId: channel.id,
      intervalMs,
      selfEdit,
      lastMessageId: config[guildId].systemMonitoring.lastMessageId || null
    };
  }

  saveConfig(config);

  // If monitoring is already running in this guild
  if (monitorState.intervals.has(guildId)) {
    await interaction.reply({
      content: 'Monitoring is already running in this guild.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  // Start monitoring
  await startMonitoring(guildId, channel, intervalMs, selfEdit, config);

  await interaction.reply({
    content: `Started monitoring the system every ${intervalMinutes} minutes in this channel. Self-edit mode: ${
      selfEdit ? 'enabled' : 'disabled'
    }.`,
    flags: MessageFlags.Ephemeral,
  });
}

// Function to start monitoring for a specific guild and channel
export async function startMonitoring(
  guildId: string,
  channel: TextChannel,
  intervalMs: number,
  selfEdit: boolean,
  config: Record<string, any>
) {
  // If selfEdit is enabled and a lastMessageId exists, try to fetch and set it
  let lastMessage: Message | null = null;
  if (selfEdit && config[guildId].systemMonitoring.lastMessageId) {
    try {
      lastMessage = await channel.messages.fetch(config[guildId].systemMonitoring.lastMessageId);
      monitorState.lastMessages.set(guildId, lastMessage);
    } catch (error) {
      console.error(`Failed to fetch last message for guild ${guildId}:`, error);
      // If fetching fails, remove the lastMessageId from config
      config[guildId].systemMonitoring.lastMessageId = null;
      saveConfig(config);
    }
  }

  const interval = setInterval(async () => {
    const usageEmbed = await getSystemUsage();
    const existingLastMessage = monitorState.lastMessages.get(guildId);

    if (selfEdit && existingLastMessage) {
      try {
        await existingLastMessage.edit({ embeds: [usageEmbed] });
      } catch (error) {
        console.error('Error updating the message:', error);
        // Attempt to send a new message if editing fails
        try {
          const newMessage = await channel.send({ embeds: [usageEmbed] });
          monitorState.lastMessages.set(guildId, newMessage);
          config[guildId].systemMonitoring.lastMessageId = newMessage.id;
          saveConfig(config);
        } catch (sendError) {
          console.error('Error sending a new message after edit failure:', sendError);
        }
      }
    } else {
      try {
        const message = await channel.send({ embeds: [usageEmbed] });
        monitorState.lastMessages.set(guildId, message);
        config[guildId].systemMonitoring.lastMessageId = message.id;
        saveConfig(config);
      } catch (error) {
        console.error('Error sending a new message:', error);
      }
    }
  }, intervalMs);

  monitorState.intervals.set(guildId, interval);

  // If selfEdit is enabled and no last message exists, send and store a new message
  if (selfEdit && !lastMessage) {
    try {
      const initialEmbed = await getSystemUsage();
      const message = await channel.send({ embeds: [initialEmbed] });
      monitorState.lastMessages.set(guildId, message);
      config[guildId].systemMonitoring.lastMessageId = message.id;
      saveConfig(config);
    } catch (error) {
      console.error('Error sending the initial monitoring message:', error);
    }
  }
}

// Function to restore monitoring for all saved configurations on bot startup
export async function restoreMonitoring(client: Client) {
  const config = loadConfig();

  for (const [guildId, guildConfig] of Object.entries(config)) {
    const systemMonitoring = guildConfig.systemMonitoring;
    if (systemMonitoring && systemMonitoring.channelId) {
      try {
        const guild = await client.guilds.fetch(guildId);
        const channel = (await guild.channels.fetch(systemMonitoring.channelId)) as TextChannel;

        if (!channel) {
          console.warn(`Channel ${systemMonitoring.channelId} not found in guild ${guildId}. Skipping monitoring.`);
          continue;
        }

        console.log(`Restoring monitoring for guild ${guild.name} in channel ${channel.name}`);
        await startMonitoring(guildId, channel, systemMonitoring.intervalMs, systemMonitoring.selfEdit, config);
      } catch (error) {
        console.error(`Failed to restore monitoring for guild ${guildId}:`, error);
      }
    }
  }
}
