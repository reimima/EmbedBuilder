import {
    ActionRowBuilder,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import type {
    ColorResolvable,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { type EmbedEditer, officialUrl } from './EmbedEditer';
import { delayDelete, isImage } from '../utils';

// eslint-disable-next-line no-useless-escape
const urlRegx = /^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/;

export class EditorSwitcher {
    private readonly modal: ModalBuilder;

    private readonly modalCustomIds: string[] = [
        'color-modal',
        'title-modal',
        'title-url-modal',
        'author-modal',
    ];

    public constructor(
        private readonly interaction: StringSelectMenuInteraction,
        private readonly embed: EmbedEditer,
        private readonly value: string,
    ) {
        this.modal = this.createModal();
    }

    public readonly init = () => ({
        color: async (): Promise<void> => {
            await this.#init();

            await this.createModalSubmitter()
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
                    await this.embed.init(this.embed);

                    return await this.succesfully(collected);
                })
                .catch(() => {});
        },

        title: async (): Promise<void> => {
            await this.#init();

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('title-modal-content');

                    this.embed.setTitle(content);
                    await this.embed.init(this.embed);

                    return await this.succesfully(collected);
                })
                .catch(() => {});
        },

        titleURL: async (): Promise<void> => {
            await this.#init();

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('title-url-modal-content');

                    // eslint-disable-next-line no-useless-escape
                    if (!urlRegx.test(content))
                        return await collected
                            .reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle('Invalid URL')
                                        .setDescription(
                                            'URL must be specified according to the rules.',
                                        ),
                                ],
                            })
                            .then(response => delayDelete([response]));

                    this.embed.setURL(content);
                    await this.embed.init(this.embed);

                    return await this.succesfully(collected);
                })
                .catch(() => {});
        },

        author: async (): Promise<void> => {
            await this.#init();

            await this.createModalSubmitter()
                .then(async collected => {
                    const content_name =
                            collected.fields.getTextInputValue('author-modal-content_1'),
                        content_icon_url =
                            collected.fields.getTextInputValue('author-modal-content_2'),
                        content_name_url =
                            collected.fields.getTextInputValue('author-modal-content_3');

                    if (!urlRegx.test(content_icon_url || content_name_url))
                        return await collected
                            .reply({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Red')
                                        .setTitle('Invalid URL')
                                        .setDescription(
                                            'URL must be specified according to the rules.',
                                        ),
                                ],
                            })
                            .then(response => delayDelete([response]));

                    if (!(await isImage(content_icon_url)))
                        await collected.channel
                            ?.send({
                                embeds: [
                                    new EmbedBuilder()
                                        .setColor('Yellow')
                                        .setTitle('Warning')
                                        .setDescription(
                                            "This url isn't image url. \nIf this message is incorrect, please ignore it.",
                                        ),
                                ],
                            })
                            .then(response => delayDelete([response]));

                    this.embed.setAuthor({
                        name: content_name,
                        iconURL: content_icon_url,
                        url: content_name_url,
                    });
                    await this.embed.init(this.embed);

                    return await this.succesfully(collected);
                })
                .catch(() => {});
        },

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
                            .setStyle(TextInputStyle.Short),
                    ),
                ),

            title: new ModalBuilder()
                .setCustomId('title-modal')
                .setTitle('Edit Embed Title')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('title-modal-content')
                            .setLabel('Title')
                            .setMaxLength(256)
                            .setPlaceholder('Some Title')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            titleURL: new ModalBuilder()
                .setCustomId('title-url-modal')
                .setTitle('Edit Embed Title URL')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('title-url-modal-content')
                            .setLabel('Title URL')
                            .setPlaceholder(officialUrl)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            author: new ModalBuilder()
                .setCustomId('author-modal')
                .setTitle('Edit Embed Author')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('author-modal-content_1')
                            .setLabel('Author Name')
                            .setMaxLength(256)
                            .setPlaceholder('Some name')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),

                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('author-modal-content_2')
                            .setLabel('Author Icon URL')
                            .setPlaceholder('https://')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),

                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('author-modal-content_3')
                            .setLabel('Author Name URL')
                            .setPlaceholder(officialUrl)
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            description: new ModalBuilder(),

            thumbnail: new ModalBuilder(),

            image: new ModalBuilder(),

            timestamp: new ModalBuilder(),

            footer: new ModalBuilder(),
        };

        return switcher[this.value as keyof typeof switcher];
    };

    private readonly createModalSubmitter = async (): Promise<ModalSubmitInteraction> =>
        await this.interaction.awaitModalSubmit({
            filter: interaction => this.modalCustomIds.includes(interaction.customId),
            time: 60_000,
        });

    private readonly succesfully = async (
        collected: ModalSubmitInteraction,
    ): Promise<NodeJS.Timeout> =>
        await collected
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Succeeded')
                        .setDescription(`Succesfully change embed ${this.value}.`),
                ],
            })
            .then(response => delayDelete([response]));

    readonly #init = async (): Promise<void> => {
        await this.interaction.showModal(this.modal);
        await this.embed.init(this.embed);
    };
}
