import type {
    APIEmbedField,
    ButtonInteraction,
    ChatInputCommandInteraction,
    InteractionResponse,
    Message,
    ModalSubmitInteraction,
    TextBasedChannel,
} from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import type { EmbedEditer } from './EmbedEditer';
import { delayDelete } from '../utils';

type rawType = {
    title: string;
    description: string;
    fields?: APIEmbedField[];
};

export class NoticeMessages {
    public constructor(private readonly embed: EmbedEditer) {}

    public readonly createInvaild = async (
        collected: ButtonInteraction | ChatInputCommandInteraction | ModalSubmitInteraction,
        raw: rawType,
        fields?: boolean,
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
        fields?: boolean,
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
        fields?: boolean,
    ): Promise<InteractionResponse | Message> => {
        delayDelete(targets);

        return await this.embed.init(this.embed, {
            components: true,
            fields: fields ?? false,
            change: false,
        });
    };
}
