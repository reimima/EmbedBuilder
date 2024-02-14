import type { InteractionResponse, Message, StringSelectMenuInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { EditorSwitcher, Structure } from '../structures';
import type { EmbedEditer, ValueType } from '../structures';
import { delayDelete } from '../utils';

export class StringSelectMenuManager extends Structure {
    public constructor(
        private readonly interaction: StringSelectMenuInteraction,
        private readonly embed: EmbedEditer,
    ) {
        super('StringSelectMenuManager');
    }

    public readonly init = async (): Promise<InteractionResponse | Message | void> => {
        switch (this.interaction.customId) {
            case 'select-options':
                return await this.runSelectOptions();

            case 'select-fields':
                return await this.runSelectFields();
        }
    };

    private readonly runSelectOptions = async (): Promise<InteractionResponse | Message | void> => {
        const value = this.interaction.values[0] as ValueType,
            switcher = new EditorSwitcher(this.interaction, this.embed, value).init();

        if (this.embed.modeManager.mode === 'delete' && value !== 'fields')
            return await this.embed.deleteProperty(value, this.interaction);

        try {
            return await switcher[value as keyof typeof switcher]();
        } catch (e) {
            this.logger.error(e);

            return await this.embed.init(
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('An unexpected error has occurred')
                    .setDescription('Please retry.'),
                { components: false, fields: false, change: false },
            );
        }
    };

    private readonly runSelectFields = async (): Promise<void> => {
        const value = Number(this.interaction.values[0]);

        this.embed.selecting = value;
        await this.interaction
            .reply({
                content: `You selected number of \`${value + 1}\` field.`,
            })
            .then(response => delayDelete([response]));

        await this.embed.init(this.embed, { components: true, fields: true, change: false });
    };
}
