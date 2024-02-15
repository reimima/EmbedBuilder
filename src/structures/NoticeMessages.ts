import type {
    APIEmbedField,
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    TextBasedChannel,
} from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import type { EmbedEditer, ValueType } from './EmbedEditer';
import { delayDelete } from '../utils';

type rawType = {
    title: string;
    description: string;
    fields?: APIEmbedField[];
};

export class NoticeMessages {
    public constructor(
        private readonly embed: EmbedEditer,
        private readonly value?: ValueType,
    ) {}

    public readonly badElementRequest = async (
        interaction: ButtonInteraction | StringSelectMenuInteraction,
        fields = false,
    ): Promise<InteractionResponse | Message> =>
        this.createInvaild(
            interaction,
            {
                title: 'Impossible operation',
                description: "Embed elements can't be less than 1.",
            },
            fields,
        );

    public readonly createSuccesfully = async (
        collected: ModalSubmitInteraction | StringSelectMenuInteraction,
    ): Promise<InteractionResponse | Message> =>
        await collected
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Succeeded')
                        .setDescription(`Succesfully change embed \`${this.value}\`.`),
                ],
            })
            .then(response => this._delayDelete([response]));

    public readonly createInvaild = async (
        collected:
            | ButtonInteraction
            | ChatInputCommandInteraction
            | ModalSubmitInteraction
            | StringSelectMenuInteraction,
        raw: rawType,
        fields = false,
    ): Promise<InteractionResponse | Message> =>
        await collected
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(raw.title)
                        .setDescription(raw.description)
                        .setFields(raw.fields ?? []),
                ],
            })
            .then(response => this._delayDelete([response], fields));

    public readonly createWarning = async (
        collected: ButtonInteraction | ModalSubmitInteraction,
        raw: rawType,
        fields = false,
    ): Promise<InteractionResponse | Message> =>
        await (collected.channel as TextBasedChannel)
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Yellow')
                        .setTitle(raw.title)
                        .setDescription(raw.description),
                ],
            })
            .then(response => this._delayDelete([response], fields));

    private readonly _delayDelete = async (
        targets: (InteractionResponse | Message)[],
        _fields = false,
    ): Promise<InteractionResponse | Message> => {
        delayDelete(targets);

        return await this.embed.init(this.embed, {
            components: true,
            fields: _fields,
            change: false,
        });
    };
}
