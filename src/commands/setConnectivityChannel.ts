import { ChatInputCommandInteraction, SlashCommandBuilder, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../monitorConfig.json');

export const data = new SlashCommandBuilder()
  .setName('setconnectivitychannel')
  .setDescription('Set the channel for internet connectivity updates')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Channel to post connectivity updates')
      .setRequired(true)
  );

// Load the configuration from the JSON file
function loadConfig(): Record<string, any> {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

// Save the configuration back to the JSON file
function saveConfig(config: Record<string, any>) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const channelOption = interaction.options.getChannel('channel', true);

  if (!channelOption || channelOption.type !== 0) {
    await interaction.reply({ content: 'Please select a valid text channel.', flags: MessageFlags.Ephemeral });
    return;
  }

  const guildId = interaction.guildId;
  if (!guildId) {
    await interaction.reply({ content: 'No guild found.', flags: MessageFlags.Ephemeral });
    return;
  }

  // Load the current configuration
  const config = loadConfig();

  // Initialize guild configuration if not already present
  if (!config[guildId]) {
    config[guildId] = {
      systemMonitoring: {
        channelId: null,
        intervalMs: 300000, // Default interval (5 minutes)
        selfEdit: false,
        lastMessageId: null,
      },
      connectivityMonitoring: {
        enabled: false,
        channelId: null,
      },
    };
  }

  // Update the connectivity channel in the configuration
  config[guildId].connectivityMonitoring.channelId = channelOption.id;
  saveConfig(config);

  await interaction.reply({
    content: `Connectivity updates will now be sent to <#${channelOption.id}>.`,
    flags: MessageFlags.Ephemeral,
  });
}
