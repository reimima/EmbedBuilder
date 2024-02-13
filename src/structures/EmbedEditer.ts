import type {
    APIEmbedField,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
} from 'discord.js';
import {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { EditorModeManager } from '../managers';

export const officialUrl = 'https://discord.com';

const attachmentUrl = 'attachment://officialIcon.png';

const inlineFieldData: APIEmbedField = {
        name: 'Inline field title',
        value: 'Inline field value',
        inline: true,
    },
    fields: APIEmbedField[] = [
        {
            name: 'Regular field title',
            value: 'Regular field value',
        },
        { ...inlineFieldData },
        { ...inlineFieldData },
    ];

const defaultEmbed = new EmbedBuilder()
    .setColor('Default')
    .setTitle('Some title')
    .setURL(officialUrl)
    .setAuthor({ name: 'Some name', iconURL: attachmentUrl, url: officialUrl })
    .setDescription('Some description')
    .setThumbnail(attachmentUrl)
    .setImage(attachmentUrl)
    .setTimestamp()
    .setFooter({ text: 'Some text', iconURL: attachmentUrl });

export class EmbedEditer extends EmbedBuilder {
    public readonly fields: APIEmbedField[] = structuredClone(fields);

    public selecting: number | null = null;

    private readonly modeManager: EditorModeManager = new EditorModeManager();

    public constructor(
        public readonly interaction: ChatInputCommandInteraction,
        raw = defaultEmbed.setFields(fields),
    ) {
        super(raw.toJSON());
    }

    public readonly init = async (
        override: EmbedBuilder | this | undefined = undefined,
        options = {
            components: true,
            fields: false,
            change: false,
        },
    ): Promise<InteractionResponse | Message> =>
        await this.interaction[override ? 'editReply' : 'reply']({
            embeds: [override ? override : this],
            components: options.components
                ? options.fields
                    ? this.buildFieldComponents()
                    : this.buildMainComponents(options.change)
                : [],
            files: [
                new AttachmentBuilder('./src/images/officialIcon.png', {
                    name: 'officialIcon.png',
                }),
            ],
        });

    private readonly buildMainComponents = (
        change = false,
    ): ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[] => [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-options')
                .setPlaceholder('Build options')
                .setOptions(
                    { label: 'color', description: 'Set the color. (HEX)', value: 'color' },
                    { label: 'title', description: 'Set the title.', value: 'title' },
                    { label: 'titleURL', description: 'Set the title URL.', value: 'titleURL' },
                    {
                        label: 'author',
                        description: 'Set the author. (3 options)',
                        value: 'author',
                    },
                    {
                        label: 'description',
                        description: 'Set the description.',
                        value: 'description',
                    },
                    { label: 'thumbnail', description: 'Set the thumbnail.', value: 'thumbnail' },
                    { label: 'fields', description: 'Set the fields.', value: 'fields' },
                    { label: 'image', description: 'Set the image.', value: 'image' },
                    { label: 'timestamp', description: 'Toggle timestamp.', value: 'timestamp' },
                    {
                        label: 'footer',
                        description: 'Set the footer. (2 options)',
                        value: 'footer',
                    },
                ),
        ),

        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('submit')
                .setLabel('✅ Submit')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('🗑️ Cancel')
                .setStyle(ButtonStyle.Danger),
        ),

        this.modeManager.generate(change),
    ];

    private readonly buildFieldComponents = (): (
        | ActionRowBuilder<ButtonBuilder>
        | ActionRowBuilder<StringSelectMenuBuilder>
    )[] => [
        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('increment')
                .setLabel('➕ Increment')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('decrement')
                .setLabel('➖ Decrement')
                .setStyle(ButtonStyle.Danger),

            new ButtonBuilder()
                .setCustomId('back')
                .setLabel('🔙 Back')
                .setStyle(ButtonStyle.Secondary),
        ),

        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('enabled_all_inline')
                .setLabel('⏫ Enabled all')
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId('enabled_inline')
                .setLabel('🔼 Enabled')
                .setStyle(ButtonStyle.Success)
                .setDisabled(!this.selecting),

            new ButtonBuilder()
                .setCustomId('disabled_inline')
                .setLabel('🔽 Disabled')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(!this.selecting),

            new ButtonBuilder()
                .setCustomId('disabled_all_inline')
                .setLabel('⏬ Disabled all')
                .setStyle(ButtonStyle.Danger),
        ),

        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select-fields')
                .setPlaceholder('Number of fields')
                .setOptions(
                    this.fields.map((_, i) => ({
                        label: `${i + 1}`,
                        description: `Edit number of ${i + 1} field.`,
                        value: `${i}`,
                    })),
                ),
        ),
    ];
}
