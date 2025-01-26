import { Client, Collection, Events, GatewayIntentBits, REST, Routes } from 'discord.js';
import { TOKEN, CLIENT_ID } from './config';
import { restoreMonitoring } from './commands/startMonitor'; // Import restoreMonitoring
import { checkConnectivityEmbed } from './utils/checkConectivity';
import fs from 'fs';
import path from 'path';

// Create a new Discord client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

// Store commands in a Collection for easy access
const commands = new Collection<string, any>();

// Dynamically read all command files from the "commands" folder
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith('.ts') || file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // "command.data.name" is how we identify the slash command's name
  if (command.data && command.execute) {
    commands.set(command.data.name, command);
  } else {
    console.warn(`Command at ${filePath} is missing "data" or "execute".`);
  }
}

// Register/Refresh Slash Commands globally (or you can do it per-guild if you prefer)
(async () => {
  try {
    const rest = new REST({ version: '10' }).setToken(TOKEN!);

    // Prepare commands in JSON format for the registration
    const slashCommandsJSON = commands.map((cmd) => cmd.data.toJSON());

    console.log('Started refreshing application (/) commands...');
    await rest.put(Routes.applicationCommands(CLIENT_ID!), { body: slashCommandsJSON });
    console.log('Successfully reloaded application (/) commands!');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
})();

// When the client is ready, run this code (once)
client.once(Events.ClientReady, async (readyClient) => {
  console.log(`Logged in as ${readyClient.user.tag}`);

  // Restore monitoring for all saved configurations
  try {
    await restoreMonitoring(client);
    console.log('Restored monitoring for all saved configurations.');
  } catch (error) {
    console.error('Error restoring monitoring:', error);
  }
});

// Periodically check connectivity every 60 seconds
setInterval(() => {
  checkConnectivityEmbed(client);
}, 60 * 1000);

// Listen for interactions
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    if (!interaction.replied) {
      await interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
    }
  }
});

// Login to Discord with your client's token
client.login(TOKEN);
