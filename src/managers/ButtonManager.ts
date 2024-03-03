import { EmbedBuilder } from 'discord.js';
import type {
    APIEmbed,
    APIEmbedField,
    ButtonInteraction,
    InteractionResponse,
    Message,
} from 'discord.js';

import type { ExClient } from '../ExClient';
import type { EmbedEditer } from '../structures';
import { NoticeMessages, Structure } from '../structures';
import { delayDelete } from '../utils';

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

        save: async () => {
            const db = this.client.db,
                conn = await db.connection();

            try {
                const user = (
                    await this.client.db.exec({
                        sql: 'SELECT * FROM users WHERE id = ?',
                        values: [this.interaction.user.id],
                    })
                )[0];

                await db.transaction(conn);
                if (user) {
                    await db.query(conn, {
                        sql: 'UPDATE users SET data = ? WHERE id = ?',
                        values: [JSON.stringify(this.embed.data), this.interaction.user.id],
                    });
                } else {
                    await db.query(conn, {
                        sql: 'INSERT INTO users VALUES (?, ?)',
                        values: [this.interaction.user.id, JSON.stringify(this.embed.data)],
                    });
                }
                await db.commit(conn);
            } catch (e) {
                const _e = await db.rollback(conn);
                if (_e) throw _e;
                else throw e;
            }

            await this.embed.init(this.embed);
            await this.interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('Successfully saved')
                            .setDescription('Successfully saved embed data.'),
                    ],
                })
                .then(response => delayDelete([response]));
        },

        load: async () => {
            const data = JSON.parse(
                String(
                    (
                        await this.client.db.exec({
                            sql: 'SELECT * FROM users WHERE id = ?',
                            values: [this.interaction.user.id],
                        })
                    )[0]?.data,
                ),
            ) as APIEmbed;

            await this.embed.updateFromJson(data);
            await this.interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('Green')
                            .setTitle('Successfully loaded')
                            .setDescription('Successfully loaded embed data.'),
                    ],
                })
                .then(response => delayDelete([response]));
        },

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
            if (this.embed.alreadlyRemove.fields) this.embed.propLength += 1;
            this.embed.alreadlyRemove.fields = false;

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

            this.embed.selectingField = null;
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

            (this.embed.fields[this.embed.selectingField!] as APIEmbedField).inline = true;
            await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        disabled_inline: async (): Promise<void> => {
            await this.interaction.update({ content: null });

            (this.embed.fields[this.embed.selectingField!] as APIEmbedField).inline = false;
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
            if (this.embed.fields.length <= 1) {
                const verify = this.verify();

                if (verify !== 0)
                    return await this.noticeMessages.createInvaild(this.interaction, verify, true);
                if (this.embed.propLength <= 1)
                    return await this.noticeMessages.badElementRequest(this.interaction, true);

                await this.noticeMessages.createWarning(
                    this.interaction,
                    {
                        title: 'All removal mode is activated',
                        description:
                            'Fields is now less than 1, so fields property has been removed.',
                    },
                    true,
                );

                if (!this.embed.alreadlyRemove.fields) this.updateFieldPropData();
            }

            await this.interaction.update({ content: null });

            this.embed.fields.splice(this.embed.selectingField!, 1);
            this.embed.setFields(this.embed.fields);
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },

        all_remove: async () => {
            const verify = this.verify();

            if (verify !== 0)
                return await this.noticeMessages.createInvaild(this.interaction, verify, true);
            if (this.embed.propLength <= 1)
                return await this.noticeMessages.badElementRequest(this.interaction, true);

            await this.interaction.update({ content: null });

            this.embed.fields.splice(0);
            this.embed.setFields(this.embed.fields);

            if (!this.embed.alreadlyRemove.fields) this.updateFieldPropData();
            return await this.embed.init(this.embed, {
                components: true,
                fields: true,
                change: false,
            });
        },
    };

    private readonly noticeMessages: NoticeMessages;

    public constructor(
        private readonly client: ExClient,
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

    private readonly updateFieldPropData = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        this.embed.data.fields = null;
        this.embed.alreadlyRemove.fields = true;

        this.embed.updatePropData();
    };

    private readonly verify = ():
        | 0
        | {
              title: string;
              description: string;
          } => {
        if (
            this.embed.propLength === 3 &&
            this.embed.isEqualArray(
                [
                    ...new Set(
                        [...Object.keys(this.embed.data), ...['timestamp', 'color']].filter(
                            value =>
                                Object.keys(this.embed.data).includes(value) &&
                                ['timestamp', 'color'].includes(value),
                        ),
                    ),
                ],
                ['timestamp', 'color'],
            ) &&
            (this.embed.selecting !== 'timestamp' || this.embed.selecting !== 'color')
        )
            return {
                title: 'Impossible operation',
                description: "Can't create an element embed with only timestamp and color.",
            };
        if (
            this.embed.propLength === 2 &&
            ((Object.keys(this.embed.data).includes('timestamp') &&
                this.embed.selecting !== 'timestamp') ||
                (Object.keys(this.embed.data).includes('color') &&
                    this.embed.selecting !== 'color'))
        )
            return {
                title: 'Impossible operation',
                description: `If there are two or fewer elements and two of them contain ${Object.keys(this.embed.data).includes('timestamp') ? 'timestamp' : 'color'}, they can't be removed.`,
            };

        return 0;
    };
}
