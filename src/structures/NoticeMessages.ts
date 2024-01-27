import type {
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    TextBasedChannel,
} from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { delayDelete } from '../utils';

type rawType = {
    title: string;
    description: string;
};

export class NoticeMessages {
    public constructor(private readonly value: string) {}

    public readonly createSuccesfully = async (
        collected: ModalSubmitInteraction | StringSelectMenuInteraction,
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

    public readonly createInvaild = async (
        collected: ModalSubmitInteraction,
        raw: rawType,
    ): Promise<NodeJS.Timeout> =>
        await collected
            .reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Red')
                        .setTitle(raw.title)
                        .setDescription(raw.description),
                ],
            })
            .then(response => delayDelete([response]));

    public readonly createWarning = async (
        collected: ModalSubmitInteraction,
        raw: rawType,
    ): Promise<NodeJS.Timeout> =>
        await (collected.channel as TextBasedChannel)
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setColor('Yellow')
                        .setTitle(raw.title)
                        .setDescription(raw.description),
                ],
            })
            .then(response => delayDelete([response]));
}
