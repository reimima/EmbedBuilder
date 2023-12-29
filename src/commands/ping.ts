import type { ChatInputCommandInteraction } from 'discord.js';

import { DCommand } from '../decorators';
import { Command } from '../structures';

@DCommand({
    name: 'ping',
    description: 'Pong!',
})
export default class extends Command {
    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();

        await interaction.followUp({ content: 'Pong!' });
    };
}
