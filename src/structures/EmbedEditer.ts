/* eslint-disable @typescript-eslint/ban-ts-comment */
import type {
    APIEmbed,
    APIEmbedField,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    MessageContextMenuCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';
import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    StringSelectMenuBuilder,
} from 'discord.js';

import { NoticeMessages } from './NoticeMessages';
import type { ExClient } from '../ExClient';
import { EditorModeManager } from '../managers';

export const officialUrl = 'https://discord.com';

const iconUrl =
    'https://cdn.discordapp.com/attachments/1207135928645197854/1207136089404350504/icon.png?ex=65de8c17&is=65cc1717&hm=d33f27c384453db16d233fe0778998c535037541d999b2059f5010ad217df98c&';

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
    .setAuthor({ name: 'Some name', iconURL: iconUrl, url: officialUrl })
    .setDescription('Some description')
    .setThumbnail(iconUrl)
    .setImage(iconUrl)
    .setTimestamp()
    .setFooter({ text: 'Some text', iconURL: iconUrl });

export type ValueType =
    | 'author'
    | 'color'
    | 'description'
    | 'fields'
    | 'footer'
    | 'image'
    | 'thumbnail'
    | 'timestamp'
    | 'title'
    | 'url';

export class EmbedEditer extends EmbedBuilder {
    public readonly fields: APIEmbedField[] = structuredClone(fields);

    public readonly modeManager: EditorModeManager = new EditorModeManager();

    public readonly alreadlyRemove: { [x in ValueType]: boolean } = {
        author: false,
        color: false,
        description: false,
        fields: false,
        footer: false,
        image: false,
        thumbnail: false,
        timestamp: false,
        title: false,
        url: false,
    };

    public selecting: Omit<ValueType, 'fields'> | null = null;

    public selectingField: number | null = null;

    public propLength = 10;

    private readonly noticeMessages: NoticeMessages = new NoticeMessages(this);

    public constructor(
        public readonly client: ExClient,
        public readonly interaction:
            | ChatInputCommandInteraction
            | MessageContextMenuCommandInteraction,
        raw = defaultEmbed.setFields(fields),
    ) {
        super(raw.data);
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
                    : await this.buildMainComponents(options.change)
                : [],
        });

    public readonly removeProperty = async (
        value: ValueType,
        interaction: StringSelectMenuInteraction,
    ): Promise<InteractionResponse | Message> => {
        if (
            this.propLength === 3 &&
            this.isEqualArray(
                [
                    ...new Set(
                        [...Object.keys(this.data), ...['timestamp', 'color']].filter(
                            value =>
                                Object.keys(this.data).includes(value) &&
                                ['timestamp', 'color'].includes(value),
                        ),
                    ),
                ],
                ['timestamp', 'color'],
            ) &&
            (this.selecting !== 'timestamp' || this.selecting !== 'color')
        )
            return await this.noticeMessages.createInvaild(interaction, {
                title: 'Impossible operation',
                description: "Can't create an element embed with only timestamp and color.",
            });
        if (
            this.propLength === 2 &&
            ((Object.keys(this.data).includes('timestamp') && this.selecting !== 'timestamp') ||
                (Object.keys(this.data).includes('color') && this.selecting !== 'color'))
        )
            return await this.noticeMessages.createInvaild(interaction, {
                title: 'Impossible operation',
                description: `If there are two or fewer elements and two of them contain ${Object.keys(this.data).includes('timestamp') ? 'timestamp' : 'color'}, they can't be removed.`,
            });
        if (this.alreadlyRemove[value]) return await interaction.update({ content: null });
        if (this.propLength <= 1) return await this.noticeMessages.badElementRequest(interaction);

        await interaction.update({ content: null });

        const data = this.data;
        // @ts-expect-error
        data[value] = null;
        this.alreadlyRemove[value] = true;

        if (!this.data.title && this.data.url) {
            // @ts-expect-error
            this.data.url = null;
            this.alreadlyRemove.url = true;
        }

        this.updatePropData();
        return await this.init(new EmbedBuilder(data));
    };

    public readonly updatePropData = () => {
        this.propLength -= Object.values(this.data).filter(value => value === null).length;
        Object.keys(this.data).forEach(key => {
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            if (this.data[key as ValueType] === null) delete this.data[key as ValueType];
        });
    };

    public readonly updateFromJson = async (data: APIEmbed): Promise<void> => {
        Object.assign(this.data, data);
        await this.init(this);
    };

    private readonly buildMainComponents = async (
        change = false,
    ): Promise<ActionRowBuilder<ButtonBuilder | StringSelectMenuBuilder>[]> => [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_options')
                .setPlaceholder('Build options')
                .setOptions(
                    { label: 'color', description: 'Set the color. (HEX)', value: 'color' },
                    { label: 'title', description: 'Set the title.', value: 'title' },
                    { label: 'titleURL', description: 'Set the title URL.', value: 'url' },
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

            new ButtonBuilder()
                .setCustomId('save')
                .setLabel('📥 Save')
                .setStyle(ButtonStyle.Primary),

            new ButtonBuilder()
                .setCustomId('load')
                .setLabel('📤 Load')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(!(await this.hasSaveData())),
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
                .setDisabled(this.selectingField === 0 ? false : !this.selectingField),

            new ButtonBuilder()
                .setCustomId('disabled_inline')
                .setLabel('🔽 Disabled')
                .setStyle(ButtonStyle.Danger)
                .setDisabled(this.selectingField === 0 ? false : !this.selectingField),

            new ButtonBuilder()
                .setCustomId('disabled_all_inline')
                .setLabel('⏬ Disabled all')
                .setStyle(ButtonStyle.Danger),
        ),

        new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('remove')
                .setLabel('🔨 Remove')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(this.selectingField === 0 ? false : !this.selectingField),

            new ButtonBuilder()
                .setCustomId('all_remove')
                .setLabel('🗑️ All Remove')
                .setStyle(ButtonStyle.Danger),
        ),

        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select_fields')
                .setPlaceholder('Number of fields')
                .setOptions(
                    this.fields.length <= 0
                        ? [
                              {
                                  label: '-',
                                  value: '-',
                              },
                          ]
                        : this.fields.map((_, i) => ({
                              label: `${i + 1}`,
                              description: `Edit number of ${i + 1} field.`,
                              value: `${i}`,
                          })),
                ),
        ),
    ];

    private readonly hasSaveData = async (): Promise<boolean> =>
        !!(
            await this.client.db.exec({
                sql: 'SELECT * FROM users WHERE id = ?',
                values: [this.interaction.user.id],
            })
        )[0];

    private readonly isEqualArray = (array1: string[], array2: string[]) => {
        let i = array1.length;

        if (i !== array2.length) return false;
        while (i--) {
            if (array1[i] !== array2[i]) return false;
        }

        return true;
    };
}
