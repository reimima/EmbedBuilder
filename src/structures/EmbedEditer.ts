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

const officialUrl = 'https://discord.com',
    attachmentUrl = 'attachment://officialIcon.png';

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
    .setFooter({ text: 'Some footer text', iconURL: attachmentUrl });

export class EmbedEditer extends EmbedBuilder {
    private readonly fields: APIEmbedField[] = fields;

    public constructor(
        private readonly interaction: ChatInputCommandInteraction,
        raw = defaultEmbed.addFields(fields),
    ) {
        super(raw.toJSON());
    }

    public readonly init = async (
        options = {
            appendedComponents: true,
            appendedFiles: true,
        },
    ): Promise<InteractionResponse> =>
        await this.interaction.reply({
            embeds: [this],
            components: options.appendedComponents ? this.buildComponents() : [],
            files: options.appendedFiles
                ? [
                      new AttachmentBuilder('./src/images/officialIcon.png', {
                          name: 'officialIcon.png',
                      }),
                  ]
                : [],
        });

    public readonly update = async (): Promise<Message> =>
        await this.interaction.editReply({ embeds: [this] });

    public readonly buildComponents = (): [
        ActionRowBuilder<StringSelectMenuBuilder>,
        ActionRowBuilder<ButtonBuilder>,
    ] => [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
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
    ];
}
