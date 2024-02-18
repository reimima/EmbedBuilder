import type {
    Embed,
    InteractionResponse,
    MessageContextMenuCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import {
    ActionRowBuilder,
    ApplicationCommandType,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { DCommand } from '../decorators';
import { ExCommand } from '../structures';
import { delayDelete } from '../utils';

@DCommand({
    name: 'export',
    type: ApplicationCommandType.Message,
})
export default class extends ExCommand {
    public readonly run = async (interaction: MessageContextMenuCommandInteraction) => {
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
        if (target.embeds.length >= 2) return await this.adapter(interaction);

        return await this.main(interaction, interaction.targetMessage.embeds[0] as Embed);
    };

    public readonly adapter = async (interaction: MessageContextMenuCommandInteraction) => {
        const response = await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Default')
                        .setTitle('Choose embed')
                        .setDescription('There are two or more embed, please select one.'),
                ],
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId('cancel')
                            .setLabel('🗑️ Cancel')
                            .setStyle(ButtonStyle.Danger),
                    ),

                    new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('select_embed')
                            .setPlaceholder('Number of Embed')
                            .addOptions(
                                interaction.targetMessage.embeds.map((_, i) => ({
                                    label: `${i + 1}`,
                                    description: `Edit number of ${i + 1} embed.`,
                                    value: `${i}`,
                                })),
                            ),
                    ),
                ],
                fetchReply: true,
            }),
            collector = response.createMessageComponentCollector({
                filter: _collected =>
                    (_collected.isStringSelectMenu() || _collected.isButton()) &&
                    _collected.user.id === interaction.user.id,
            });

        collector.on('collect', async collected => {
            await interaction.deleteReply();

            if (!collected.isStringSelectMenu()) return;
            const value = Number(collected.values[0]),
                embed = interaction.targetMessage.embeds[value] as Embed;

            await this.main(collected, embed);
        });
    };

    public readonly main = async (
        interaction: MessageContextMenuCommandInteraction | StringSelectMenuInteraction,
        embed: Embed,
    ): Promise<InteractionResponse> =>
        await interaction.reply({
            files: [
                new AttachmentBuilder(Buffer.from(JSON.stringify(embed.data)), {
                    name: 'data.json',
                }),
            ],
            ephemeral: true,
        });
}
