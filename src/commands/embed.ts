import { type ChatInputCommandInteraction } from 'discord.js';

import { DCommand } from '../decorators';
import { ButtonManager, StringSelectMenuManager } from '../managers';
import { EmbedEditer, ExCommand } from '../structures';

@DCommand({
    name: 'embed',
    description: 'Make your own embed!',
})
export default class extends ExCommand {
    private embed!: EmbedEditer;

    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        this.embed = new EmbedEditer(interaction);

        const collector = (await this.embed.init()).createMessageComponentCollector({
            filter: collected =>
                (collected.isStringSelectMenu() || collected.isButton()) &&
                collected.user.id === interaction.user.id,
        });

        collector.on('collect', async interaction => {
            if (interaction.isStringSelectMenu()) {
                await new StringSelectMenuManager(interaction, this.embed).init();
            } else if (interaction.isButton()) {
                await new ButtonManager(interaction, this.embed).init();
            }
        });
    };
}
