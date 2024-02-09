import { ApplicationCommandOptionType, type ChatInputCommandInteraction } from 'discord.js';

import { DCommand } from '../decorators';
import { ButtonManager, StringSelectMenuManager } from '../managers';
import { EmbedEditer, ExCommand } from '../structures';

@DCommand({
    name: 'embed',
    description: 'Make your own embed!',
    options: [
        {
            type: ApplicationCommandOptionType.String,
            name: 'submit_type',
            description: 'You can choose reply or send.',
            choices: [
                {
                    name: 'reply',
                    value: 'reply',
                },
                {
                    name: 'send',
                    value: 'send',
                },
            ],
        },
    ],
})
export default class extends ExCommand {
    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        const embed = new EmbedEditer(interaction),
            collector = (await embed.init()).createMessageComponentCollector({
                filter: collected =>
                    (collected.isStringSelectMenu() || collected.isButton()) &&
                    collected.user.id === interaction.user.id,
            }),
            submit_type = (interaction.options.get('submit_type')?.value ?? 'reply') as
                | 'reply'
                | 'send';

        collector.on('collect', async interaction => {
            if (interaction.isStringSelectMenu()) {
                await new StringSelectMenuManager(interaction, embed).init();
            } else if (interaction.isButton()) {
                await new ButtonManager(interaction, embed, submit_type).init();
            }
        });
    };
}
