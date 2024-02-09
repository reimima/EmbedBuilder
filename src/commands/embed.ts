import { type ChatInputCommandInteraction } from 'discord.js';

import { DCommand } from '../decorators';
import { ButtonManager, StringSelectMenuManager } from '../managers';
import { EmbedEditer, ExCommand } from '../structures';

@DCommand({
    name: 'embed',
    description: 'Make your own embed!',
})
export default class extends ExCommand {
    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const embed = new EmbedEditer(interaction),
            collector = (await embed.init()).createMessageComponentCollector({
                filter: collected =>
                    (collected.isStringSelectMenu() || collected.isButton()) &&
                    collected.user.id === interaction.user.id,
            });

        collector.on('collect', async interaction => {
            if (interaction.isStringSelectMenu()) {
                await new StringSelectMenuManager(interaction, embed).init();
            } else if (interaction.isButton()) {
                await new ButtonManager(interaction, embed).init();
            }
        });
    };
}
