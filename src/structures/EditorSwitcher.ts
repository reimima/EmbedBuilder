import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import type {
    ColorResolvable,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { type EmbedEditer, officialUrl } from './EmbedEditer';
import { NoticeMessages } from './NoticeMessages';
import { checkImageFormat } from '../utils';

// eslint-disable-next-line no-useless-escape
const urlRegx = /^https?:\/\/[\w/:%#\$&\?\(\)~\.=\+\-]+$/;

export class EditorSwitcher {
    private readonly modal!: ModalBuilder;

    private readonly modalCustomIds: string[] = [
        'color-modal',
        'title-modal',
        'title-url-modal',
        'author-modal',
        'description-modal',
        'thumbnail-modal',
        'image-modal',
        'footer-modal',
    ];

    private readonly noticeMessages: NoticeMessages;

    public constructor(
        private readonly interaction: StringSelectMenuInteraction,
        private readonly embed: EmbedEditer,
        private readonly value: string,
    ) {
        if (value !== 'timestamp') this.modal = this.createModal();

        this.noticeMessages = new NoticeMessages(value);
    }

    public readonly init = () => ({
        color: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('color-modal-content');

                    if (!/^#[0-9A-F]{6}$/i.test(content))
                        return await this.noticeMessages.createInvaild(collected, {
                            title: 'Invalid hex color',
                            description: 'Hex colors must be specified according to the rules.',
                        });

                    this.embed.setColor(content as ColorResolvable);
                    await this.embed.init(this.embed);

                    return await this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        title: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('title-modal-content');

                    this.embed.setTitle(content);
                    await this.embed.init(this.embed);

                    return await this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        titleURL: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('title-url-modal-content');

                    if (!urlRegx.test(content))
                        return await this.noticeMessages.createInvaild(collected, {
                            title: 'Invalid URL',
                            description: 'URL must be specified according to the rules.',
                        });

                    this.embed.setURL(content);
                    await this.embed.init(this.embed);

                    return await this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        author: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content_name =
                            collected.fields.getTextInputValue('author-modal-content_1'),
                        content_icon_url = await this.imageVerify(
                            collected,
                            'author-modal-content_2',
                        ),
                        content_name_url =
                            collected.fields.getTextInputValue('author-modal-content_3');

                    if (typeof content_icon_url !== 'string') return;

                    this.embed.setAuthor({
                        name: content_name,
                        iconURL: content_icon_url,
                        url: content_name_url,
                    });
                    await this.embed.init(this.embed);

                    return this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        description: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = collected.fields.getTextInputValue('description-modal-content');

                    this.embed.setDescription(content);
                    await this.embed.init(this.embed);

                    return this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        thumbnail: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = await this.imageVerify(collected, 'thumbnail-modal-content');

                    if (typeof content !== 'string') return;

                    this.embed.setThumbnail(content);
                    await this.embed.init(this.embed);

                    return this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        fields: async (): Promise<void> => {},

        image: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content = await this.imageVerify(collected, 'image-modal-content');

                    if (typeof content !== 'string') return;

                    this.embed.setImage(content);
                    await this.embed.init(this.embed);

                    return this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },

        timestamp: async (): Promise<NodeJS.Timeout> => {
            this.embed.setTimestamp(this.embed.data.timestamp ? null : Date.now());
            await this.embed.init(this.embed);

            return this.noticeMessages.createSuccesfully(this.interaction);
        },

        footer: async (): Promise<void> => {
            await this.interaction.showModal(this.modal);

            await this.createModalSubmitter()
                .then(async collected => {
                    const content_text =
                            collected.fields.getTextInputValue('footer-modal-content_1'),
                        content_icon_url = await this.imageVerify(
                            collected,
                            'footer-modal-content_2',
                        );

                    if (typeof content_icon_url !== 'string') return;

                    this.embed.setFooter({ text: content_text, iconURL: content_icon_url });
                    await this.embed.init(this.embed);

                    return this.noticeMessages.createSuccesfully(collected);
                })
                .catch(() => {});
        },
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

            description: new ModalBuilder()
                .setCustomId('description-modal')
                .setTitle('Edit Embed Description')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('description-modal-content')
                            .setLabel('Description')
                            .setPlaceholder('Some Description')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            thumbnail: new ModalBuilder()
                .setCustomId('thumbnail-modal')
                .setTitle('Edit Embed Thumbnail')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('thumbnail-modal-content')
                            .setLabel('Thumbnail URL')
                            .setPlaceholder('https://')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            image: new ModalBuilder()
                .setCustomId('image-modal')
                .setTitle('Edit Embed Image')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('image-modal-content')
                            .setLabel('Image URL')
                            .setPlaceholder('https://')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),

            footer: new ModalBuilder()
                .setCustomId('footer-modal')
                .setTitle('Edit Embed Footer')
                .addComponents(
                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('footer-modal-content_1')
                            .setLabel('Footer Text')
                            .setMaxLength(2048)
                            .setPlaceholder('Some text')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),

                    new ActionRowBuilder<TextInputBuilder>().addComponents(
                        new TextInputBuilder()
                            .setCustomId('footer-modal-content_2')
                            .setLabel('Footer Icon URL')
                            .setPlaceholder('https://')
                            .setRequired(true)
                            .setStyle(TextInputStyle.Paragraph),
                    ),
                ),
        };

        return switcher[this.value as keyof typeof switcher];
    };

    private readonly createModalSubmitter = async (): Promise<ModalSubmitInteraction> =>
        await this.interaction.awaitModalSubmit({
            filter: interaction => this.modalCustomIds.includes(interaction.customId),
            time: 60_000,
        });

    private readonly imageVerify = async (
        collected: ModalSubmitInteraction,
        customId: string,
    ): Promise<NodeJS.Timeout | string> => {
        const content = collected.fields.getTextInputValue(customId);

        if (!urlRegx.test(content))
            return await this.noticeMessages.createInvaild(collected, {
                title: 'Invalid URL',
                description: 'URL must be specified according to the rules.',
            });

        if (!checkImageFormat(content, ['png', 'jpg', 'webp', 'gif']))
            await this.noticeMessages.createWarning(collected, {
                title: 'Unsupported format',
                description: "Discord doesn't support this image format.",
            });

        return content;
    };
}
