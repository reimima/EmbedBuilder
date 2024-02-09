import type {
    ButtonInteraction,
    InteractionResponse,
    Message,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    TextBasedChannel,
} from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import type { EmbedEditer } from './EmbedEditer';
import { delayDelete } from '../utils';

type rawType = {
    title: string;
    description: string;
};

export class NoticeMessages {
    public constructor(
        private readonly embed: EmbedEditer,
        private readonly value?: string,
    ) {}

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
        collected: ButtonInteraction | ModalSubmitInteraction,
        raw: rawType,
        fields?: boolean,
    ): Promise<InteractionResponse | Message> =>
        await collected
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(raw.title)
                        .setDescription(raw.description),
                ],
            })
            .then(response => this._delayDelete([response], fields));

    public readonly createWarning = async (
        collected: ModalSubmitInteraction,
        raw: rawType,
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
            .then(response => this._delayDelete([response]));

    private readonly _delayDelete = async (
        targets: (InteractionResponse | Message)[],
        fields?: boolean,
    ): Promise<InteractionResponse | Message> => {
        delayDelete(targets);

        return await this.embed.init(this.embed, {
            components: true,
            files: true,
            fields: fields ?? false,
        });
    };
}
