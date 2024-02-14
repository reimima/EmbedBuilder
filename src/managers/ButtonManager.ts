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

        mode_change: async (): Promise<void> => {
            await this.interaction.update({ content: null });
            await this.embed.init(this.embed, { components: true, fields: false, change: true });
        },

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
                        fields: [
                            {
                                name: 'Recommend',
                                value: 'If you want to remove a field, you must select the field and press remove.',
                            },
                        ],
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

        back: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            this.embed.selecting = null;
            await this.embed.init(this.embed);
        },

        enabled_all_inline: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            this.embed.fields.map(field => (field.inline = true));
            await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        enabled_inline: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            (this.embed.fields[this.embed.selecting!] as APIEmbedField).inline = true;
            await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        disabled_inline: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            (this.embed.fields[this.embed.selecting!] as APIEmbedField).inline = false;
            await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        disabled_all_inline: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            this.embed.fields.map(field => (field.inline = false));
            await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        remove: async () => {
            if (this.embed.fields.length <= 1)
                await this.noticeMessages.createWarning(
                    this.interaction,
                    {
                        title: 'All removal mode is activated',
                        description:
                            'Fields is now less than 1, so fields property has been removed.',
                    },
                    true,
                );

            await this.interaction.update({ content: null });

            this.embed.fields.splice(this.embed.selecting!, 1);
            this.embed.setFields(this.embed.fields);
            await this.embed.init(this.embed, { components: true, fields: true, change: false });
        },

        all_remove: async () => {
            await this.interaction.update({ content: null });

            this.embed.fields.splice(0);
            this.embed.setFields(this.embed.fields);
            await this.embed.init(this.embed, { components: true, fields: true, change: false });
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
}
