import { SlashCommandBuilder, ChatInputCommandInteraction, MessageFlags } from 'discord.js'
import { monitorState } from './startMonitor'

export const data = new SlashCommandBuilder()
  .setName('stopmonitor')
  .setDescription('Stops monitoring of the system')

export async function execute(interaction: ChatInputCommandInteraction) {
  const guildId = interaction.guildId

  if (!guildId || !monitorState.intervals.has(guildId)) {
    await interaction.reply({
      content: 'Monitoring is not actively running in this server.',
      flags: MessageFlags.Ephemeral
    })
    return
  }

  // Clear the interval for the specific guild
  const interval = monitorState.intervals.get(guildId)
  if (interval) clearInterval(interval)
  monitorState.intervals.delete(guildId)

  await interaction.reply({
    content: 'Stopped monitoring the system in this server.',
    flags: MessageFlags.Ephemeral
  })
}
