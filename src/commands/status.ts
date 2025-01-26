import { SlashCommandBuilder, ChatInputCommandInteraction, TextChannel, MessageFlags } from 'discord.js';
import { getSystemUsage } from '../utils/systemUsage';
import { monitorState, loadConfig, saveConfig } from './startMonitor';

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Shows the status of the system and resets the interval if running');

export async function execute(interaction: ChatInputCommandInteraction) {
  const channel = interaction.channel;
  if (!channel || !(channel instanceof TextChannel)) {
    await interaction.reply({
      content: 'Please use this command in a server text channel.',
      flags: MessageFlags.Ephemeral,
    });
    return;
  }

  const guildId = interaction.guildId!;
  const config = loadConfig();

  // Ensure config[guildId] and config[guildId].systemMonitoring are initialized
  if (!config[guildId]) {
    config[guildId] = {
      systemMonitoring: {
        channelId: channel.id,
        intervalMs: 300000, // Default to 5 minutes
        selfEdit: false,
        lastMessageId: null,
      },
      connectivityMonitoring: {
        enabled: false,
      },
    };
    saveConfig(config);
  } else if (!config[guildId].systemMonitoring) {
    config[guildId].systemMonitoring = {
      channelId: channel.id,
      intervalMs: 300000,
      selfEdit: false,
      lastMessageId: null,
    };
    saveConfig(config);
  }

  // Fetch the current system status
  try {
    const usageEmbed = await getSystemUsage();

    // Check if monitoring is already running
    if (monitorState.intervals.has(guildId)) {
      const lastMessage = monitorState.lastMessages.get(guildId);
      const { intervalMs, selfEdit } = config[guildId].systemMonitoring;

      if (selfEdit && lastMessage) {
        try {
          // Edit the existing last message
          await lastMessage.edit({ embeds: [usageEmbed] });
          await interaction.reply({
            content: 'Updated the existing system status message.',
            flags: MessageFlags.Ephemeral,
          });
        } catch (error) {
          console.error('Error editing the existing message:', error);

          // If editing the last message fails, send a new message
          const newMessage = await channel.send({ embeds: [usageEmbed] });
          monitorState.lastMessages.set(guildId, newMessage);
          config[guildId].systemMonitoring.lastMessageId = newMessage.id;
          saveConfig(config);

          await interaction.reply({
            content: 'Could not edit the existing message. Sent a new status message.',
            flags: MessageFlags.Ephemeral,
          });
        }
      } else {
        // If selfEdit is disabled, send a new message
        const newMessage = await channel.send({ embeds: [usageEmbed] });
        monitorState.lastMessages.set(guildId, newMessage);
        config[guildId].systemMonitoring.lastMessageId = newMessage.id;
        saveConfig(config);

        await interaction.reply({
          content: 'System status message sent successfully.',
          flags: MessageFlags.Ephemeral,
        });
      }

      // Reset the interval to ensure it continues as configured
      const existingInterval = monitorState.intervals.get(guildId);
      if (existingInterval) clearInterval(existingInterval);

      const interval = setInterval(async () => {
        const embed = await getSystemUsage();
        const message = monitorState.lastMessages.get(guildId);

        if (selfEdit && message) {
          try {
            await message.edit({ embeds: [embed] });
          } catch (error) {
            console.error('Error updating the message during the interval:', error);
          }
        } else {
          const newMsg = await channel.send({ embeds: [embed] });
          monitorState.lastMessages.set(guildId, newMsg);
          config[guildId].systemMonitoring.lastMessageId = newMsg.id;
          saveConfig(config);
        }
      }, intervalMs);

      monitorState.intervals.set(guildId, interval);
    } else {
      // If monitoring is not running, just send the status
      const newMessage = await channel.send({ embeds: [usageEmbed] });
      monitorState.lastMessages.set(guildId, newMessage);
      config[guildId].systemMonitoring.lastMessageId = newMessage.id;
      saveConfig(config);

      await interaction.reply({
        content: 'System status message sent successfully.',
        flags: MessageFlags.Ephemeral,
      });
    }
  } catch (error) {
    console.error('Error fetching system status:', error);
    await interaction.reply({
      content: 'Failed to fetch the system status. Please try again later.',
      flags: MessageFlags.Ephemeral,
    });
  }
}
