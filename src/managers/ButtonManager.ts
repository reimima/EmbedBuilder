import { EmbedBuilder } from 'discord.js';
import type { APIEmbedField, ButtonInteraction, InteractionResponse, Message } from 'discord.js';

import type { EmbedEditer } from '../structures';
import { NoticeMessages, Structure } from '../structures';

export class ButtonManager extends Structure {
    private readonly switcher = {
        submit: async (): Promise<InteractionResponse | Message | undefined> => {
            if (this.submit_type === 'reply')
                return await this.embed.init(this.embed, {
                    components: false,
                    fields: false,
                    change: false,
                });

            await this.interaction.message.delete();
            return await this.interaction.channel?.send({
                embeds: [new EmbedBuilder(this.embed.data)],
            });
        },

        cancel: async (): Promise<Message> => await this.interaction.message.delete(),

        create_mode: async () => await this.changeMode(),

        delete_mode: async () => await this.changeMode(),

        increment: async (): Promise<InteractionResponse | Message> => {
            if (this.embed.fields.length >= 25)
                return this.noticeMessages.createInvaild(
                    this.interaction,
                    {
                        title: 'Impossible operation',
                        description: 'The number of fields must be 25 or less.',
                    },
                    true,
                );

            await this.interaction.update({ content: null });
            this.embed.fields.push({
                name: 'Regular field title',
                value: 'Regular field value',
            });
            this.embed.setFields(this.embed.fields);

            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        decrement: async (): Promise<InteractionResponse | Message> => {
            if (this.embed.fields.length <= 1)
                return this.noticeMessages.createInvaild(
                    this.interaction,
                    {
                        title: 'Impossible operation',
                        description: 'The number of fields must be 1 or more.',
                    },
                    true,
                );

            await this.interaction.update({ content: null });
            this.embed.fields.pop();
            this.embed.setFields(this.embed.fields);

            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        back: async (): Promise<InteractionResponse | Message> => {
            await this.interaction.update({ content: null });

            this.embed.selecting = null;
            return await this.embed.init(this.embed);
        },

        enabled_all_inline: async (): Promise<InteractionResponse | Message> => {
            await this.interaction.update({ content: null });

            this.embed.fields.map(field => (field.inline = true));
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        enabled_inline: async (): Promise<InteractionResponse | Message> => {
            await this.interaction.update({ content: null });

            (this.embed.fields[this.embed.selecting!] as APIEmbedField).inline = true;
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        disabled_inline: async (): Promise<InteractionResponse | Message> => {
            await this.interaction.update({ content: null });

            (this.embed.fields[this.embed.selecting!] as APIEmbedField).inline = false;
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        disabled_all_inline: async (): Promise<InteractionResponse | Message> => {
            await this.interaction.update({ content: null });

            this.embed.fields.map(field => (field.inline = false));
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },
    };

    private readonly noticeMessages: NoticeMessages;

    public constructor(
        private readonly interaction: ButtonInteraction,
        private readonly embed: EmbedEditer,
        private readonly submit_type: 'reply' | 'send',
    ) {
        super('ButtonManager');

        this.noticeMessages = new NoticeMessages(embed);
    }

    public readonly init = async (): Promise<void> => {
        try {
            await this.switcher[this.interaction.customId as keyof typeof this.switcher]();
        } catch (e) {
            this.logger.error(e);

            await this.embed.init(
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('An unexpected error has occurred')
                    .setDescription('Please retry.'),
                { components: false, fields: false, change: false },
            );
        }
    };

    private readonly changeMode = async (): Promise<void> => {
        await this.interaction.update({ content: null });
        await this.embed.init(this.embed, { components: true, fields: false, change: true });
    };
}
