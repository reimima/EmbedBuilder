import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import type { ColorResolvable, StringSelectMenuInteraction } from 'discord.js';

import type { EmbedEditer } from './EmbedEditer';
import { delayDelete } from '../utils';

export class EditorSwitcher {
    private readonly modal: ModalBuilder;

    private readonly modalCustomIds: string[] = ['color-modal'];

    public constructor(
        private readonly interaction: StringSelectMenuInteraction,
        private readonly embed: EmbedEditer,
        private readonly value: string,
    ) {
        this.modal = this.createModal();
    }

    public readonly init = () => ({
        color: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.interaction
                .awaitModalSubmit({
                    filter: interaction => this.modalCustomIds.includes(interaction.customId),
                    time: 60_000,
                })
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('color-modal-content');

                    if (!/^#[0-9A-F]{6}$/i.test(content))
                        return await collected
                            .reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle('Invalid hex color')
                                        .setDescription(
                                            'Hex colors must be specified according to the rules.',
                                        ),
                                ],
                            })
                            .then(response => delayDelete([response]));

                    this.embed.setColor(content as ColorResolvable);
                    await this.embed.update();

                    return await collected
                        .reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('Green')
                                    .setTitle('Succeeded')
                                    .setDescription('Succesfully change embed color.'),
                            ],
                        })
                        .then(response => delayDelete([response]));
                })
                .catch(
                    async () =>
                        await this.interaction.channel
                            ?.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle('Timeout')
                                        .setDescription('Please retry.'),
                                ],
                            })
                            .then(message => delayDelete([message])),
                );
        },

        title: async (): Promise<void> => {},

        titleURL: async (): Promise<void> => {},

        author: async (): Promise<void> => {},

        description: async (): Promise<void> => {},

        thumbnail: async (): Promise<void> => {},

        image: async (): Promise<void> => {},

        timestamp: async (): Promise<void> => {},

        footer: async (): Promise<void> => {},
    });

    private readonly createModal = (): ModalBuilder => {
        const switcher = {
            color: new ModalBuilder()
                .setCustomId('color-modal')
                .setTitle('Edit Embed Color')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('color-modal-content')
                            .setLabel('Color')
                            .setMinLength(7)
                            .setMaxLength(7)
                            .setPlaceholder('#FFFFFF')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Short)
                            .setValue('#FFFFFF'),
                    ),
                ),

            title: new ModalBuilder(),

            titleURL: new ModalBuilder(),

            author: new ModalBuilder(),

            description: new ModalBuilder(),

            thumbnail: new ModalBuilder(),

            image: new ModalBuilder(),

            timestamp: new ModalBuilder(),

            footer: new ModalBuilder(),
        };

        return switcher[this.value as keyof typeof switcher];
    };
}
