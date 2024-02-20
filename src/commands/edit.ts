import type { Embed, Message, MessageContextMenuCommandInteraction } from 'discord.js';
import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { DCommand } from '../decorators';
import { ButtonManager, StringSelectMenuManager } from '../managers';
import { EmbedEditer, ExCommand } from '../structures';
import { delayDelete } from '../utils';

@DCommand({
    name: 'edit',
    type: ApplicationCommandType.Message,
})
export default class extends ExCommand {
    private submit_type: 'reply' | 'send' = 'reply';

    private over: boolean = true;

    public readonly run = async (
        interaction: MessageContextMenuCommandInteraction,
    ): Promise<NodeJS.Timeout | void> => {
        await interaction.deferReply();

        const target = interaction.targetMessage;

        if (!target.embeds)
            return await interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Red')
                            .setTitle('Embed was not found')
                            .setDescription('Embed was not found in the specified message.'),
                    ],
                })
                .then(response => delayDelete([response]));
        if (target.embeds.length >= 2)
            return this.adapter(
                interaction,
                (await interaction.channel?.send({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Default')
                            .setTitle('Choose embed')
                            .setDescription('There are two or more embed, please select one.'),
                    ],
                    components: this.buildComponents(interaction.targetMessage),
                })) as Message,
            );

        this.over = false;
        return this.adapter(
            interaction,
            (await interaction.channel?.send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Default')
                        .setTitle('Choose submit type')
                        .setDescription('You can choose submit type from reply or send.'),
                ],
                components: this.buildBaseComponents(false),
            })) as Message,
        );
    };

    public readonly adapter = (
        interaction: MessageContextMenuCommandInteraction,
        response: Message,
    ): void => {
        const collector = response.createMessageComponentCollector({
            filter: _collected =>
                (_collected.isStringSelectMenu() || _collected.isButton()) &&
                _collected.user.id === interaction.user.id,
        });

        collector.on('collect', async collected => {
            await collected.update({ content: null });

            if (collected.isButton()) {
                switch (collected.customId) {
                    case 'cancel':
                        await response.delete();
                        break;

                    case 'to_send':
                    case 'to_reply':
                        this.submit_type = this.submit_type === 'reply' ? 'send' : 'reply';
                        await response.edit({
                            embeds: [response.embeds[0] as Embed],
                            components: this.over
                                ? this.buildComponents(interaction.targetMessage)
                                : this.buildBaseComponents(false),
                        });
                        break;

                    case 'submit':
                        await this.main(interaction, response);
                        break;
                }
            } else if (collected.isStringSelectMenu()) {
                await this.main(interaction, response, Number(collected.values[0]));
            }
        });
    };

    private readonly main = async (
        interaction: MessageContextMenuCommandInteraction,
        response: Message,
        value?: number,
    ): Promise<void> => {
        await response.delete();

        const data = new EmbedBuilder(interaction.targetMessage.embeds[value ?? 0]?.data),
            embed = new EmbedEditer(this.client, interaction, data),
            collector = (await embed.init(data)).createMessageComponentCollector({
                filter: _collected =>
                    (_collected.isStringSelectMenu() || _collected.isButton()) &&
                    _collected.user.id === interaction.user.id,
            });

        collector.on('collect', async _interaction => {
            if (_interaction.isStringSelectMenu()) {
                await new StringSelectMenuManager(_interaction, embed).init();
            } else if (_interaction.isButton()) {
                await new ButtonManager(_interaction, embed, this.submit_type).init();
            }
        });
    };

    private readonly buildComponents = (
        targetMessage: Message,
    ): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] => [
        ...this.buildBaseComponents(true),

        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_embed')
                .setPlaceholder('Number of Embed')
                .addOptions(
                    targetMessage.embeds.map((_, i) => ({
                        label: `${i + 1}`,
                        description: `Edit number of ${i + 1} embed.`,
                        value: `${i}`,
                    })),
                ),
        ),
    ];

    private readonly buildBaseComponents = (disable: boolean): ActionRowBuilder<ButtonBuilder>[] => [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('🗑️ Cancel')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('submit')
                .setLabel('✅ Submit')
                .setStyle(ButtonStyle.Success)
                .setDisabled(disable),

            this.submit_type === 'reply'
                ? new ButtonBuilder()
                      .setCustomId('to_send')
                      .setLabel('📨 To Send Mode')
                      .setStyle(ButtonStyle.Secondary)
                : new ButtonBuilder()
                      .setCustomId('to_reply')
                      .setLabel('🔁 To Reply Mode')
                      .setStyle(ButtonStyle.Secondary),
        ),
    ];
}
