import { ApplicationCommandOptionType, EmbedBuilder } from 'discord.js';
import type {
    APIEmbed,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
} from 'discord.js';

import { DCommand } from '../decorators';
import { ButtonManager, StringSelectMenuManager } from '../managers';
import { EmbedEditer, ExCommand } from '../structures';
import { delayDelete } from '../utils';

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
        {
            type: ApplicationCommandOptionType.Attachment,
            name: 'source',
            description: 'You can import source data. (.json)',
        },
    ],
})
export default class extends ExCommand {
    public readonly run = async (
        interaction: ChatInputCommandInteraction,
    ): Promise<NodeJS.Timeout | void> => {
        let source: EmbedBuilder | undefined;
        let response: InteractionResponse | Message;
        const attachment = interaction.options.getAttachment('source');

        if (attachment && !attachment.name.endsWith('.json'))
            return await interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Incorrect extension')
                            .setDescription('The source file must be `.json`.'),
                    ],
                })
                .then(response => delayDelete([response]));
        if (attachment)
            source = new EmbedBuilder((await (await fetch(attachment.url)).json()) as APIEmbed);

        const embed = new EmbedEditer(interaction, source);

        try {
            response = await embed.init();
        } catch {
            return await interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('An Error Occured When Sending A Message')
                            .setFields({
                                name: 'Error possibility',
                                value: 'It is possible that the source in the `.json` file is not correct.',
                            }),
                    ],
                })
                .then(response => delayDelete([response], 5));
        }

        const collector = response.createMessageComponentCollector({
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
