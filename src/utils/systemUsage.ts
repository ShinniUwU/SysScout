import { EmbedBuilder } from 'discord.js';
import si from 'systeminformation';

function createBar(percentage: number, totalBlocks = 20): string {
  const filledBlocks = Math.round((percentage / 100) * totalBlocks);
  const filled = '🟩'.repeat(filledBlocks);
  const empty = '⬜'.repeat(totalBlocks - filledBlocks);
  return filled + empty;
}

export async function getSystemUsage() {
  
  try {
    const cpuLoad = await si.currentLoad();
    const memData = await si.mem();
    const fsSize = await si.fsSize();

    const cpuUsagePercent = cpuLoad.currentLoad;
    const cpuBar = createBar(cpuUsagePercent);

    const memUsagePercent = (memData.used / memData.total) * 100;
    const memBar = createBar(memUsagePercent);

    const swapUsagePercent = (memData.swapused / memData.swaptotal) * 100 || 0;
    const swapBar = Number.isFinite(swapUsagePercent)
      ? createBar(swapUsagePercent)
      : 'No Swap';

    let diskString = '';
    fsSize.forEach((disk, index) => {
      const usedPercent = (disk.used / disk.size) * 100;
      const diskBar = createBar(usedPercent);
      const diskType = disk.type || 'Unknown';

      // Color coding based on usage
      let diskColor = 0x00ff99; // Green by default
      if (usedPercent > 80) diskColor = 0xff0000; // Red
      else if (usedPercent > 50) diskColor = 0xffa500; // Orange

      diskString += `**Disk ${index + 1} (${diskType})**\n` +
                   `Used: **${usedPercent.toFixed(1)}%**\n${diskBar}\n\n`;
    });

    // Color coding based on CPU usage
    let cpuColor = 0x00ff99; // Green
    if (cpuUsagePercent > 80) cpuColor = 0xff0000; // Red
    else if (cpuUsagePercent > 50) cpuColor = 0xffa500; // Orange

    // Color coding based on Memory usage
    let memColor = 0x00ff99; // Green
    if (memUsagePercent > 80) memColor = 0xff0000; // Red
    else if (memUsagePercent > 50) memColor = 0xffa500; // Orange

    const embed = new EmbedBuilder()
      .setColor(cpuColor)
      .setTitle('📊 **System Usage**')
      .addFields(
        {
          name: '🖥 **CPU Usage**',
          value: `**${cpuUsagePercent.toFixed(1)}%**\n${cpuBar}`
        },
        {
          name: '💾 **Memory Usage**',
          value: `**${memUsagePercent.toFixed(1)}%**\n${memBar}`
        },
        {
          name: '🔄 **Swap Usage**',
          value: `${Number.isFinite(swapUsagePercent) ? `**${swapUsagePercent.toFixed(1)}%**\n${swapBar}` : 'No Swap'}`
        },
        {
          name: '💽 **Disk Usage**',
          value: diskString || 'No disk info available.'
        },
      )
      .setFooter({ text: 'SysScout - System Monitoring Bot' })
      .setTimestamp();

    return embed;
  } catch (error) {
    console.error('Error fetching system usage:', error);
    const errorEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('❌ **Error Fetching System Usage**')
      .setDescription('An error occurred while retrieving system metrics.')
      .setTimestamp();
    return errorEmbed;
  }
}
