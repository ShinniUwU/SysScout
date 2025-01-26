import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js';
import fs from 'fs';
import path from 'path';

const configPath = path.join(__dirname, '../monitorConfig.json');

export const data = new SlashCommandBuilder()
  .setName('setconnectivity')
  .setDescription('Enable or disable internet connectivity monitoring')
  .addStringOption(option =>
    option
      .setName('action')
      .setDescription('Choose to enable or disable connectivity monitoring')
      .setRequired(true)
      .addChoices(
        { name: 'Enable', value: 'enable' },
        { name: 'Disable', value: 'disable' }
      )
  );

function loadConfig(): Record<string, any> {
  if (!fs.existsSync(configPath)) return {};
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function saveConfig(config: Record<string, any>) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

export async function execute(interaction: ChatInputCommandInteraction) {
  const action = interaction.options.getString('action', true).toLowerCase();
  const guildId = interaction.guildId;

  if (!guildId) {
    await interaction.reply({
      content: 'This command can only be used within a server.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const config = loadConfig();

  // Initialize guild config if it doesn't exist
  if (!config[guildId]) {
    config[guildId] = {
      systemMonitoring: {
        channelId: null,
        intervalMs: 300000, // Default to 5 minutes
        selfEdit: false,
        lastMessageId: null
      },
      connectivityMonitoring: {
        enabled: false
      }
    };
  }

  if (action === 'enable') {
    config[guildId].connectivityMonitoring.enabled = true;
    saveConfig(config);

    await interaction.reply({
      content: 'Internet connectivity monitoring has been **enabled** for this server.',
      flags: MessageFlags.Ephemeral,
    });
  } else if (action === 'disable') {
    config[guildId].connectivityMonitoring.enabled = false;
    saveConfig(config);

    await interaction.reply({
      content: 'Internet connectivity monitoring has been **disabled** for this server.',
      flags: MessageFlags.Ephemeral,
    });
  } else {
    await interaction.reply({
      content: 'Invalid action. Please choose **Enable** or **Disable**.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
