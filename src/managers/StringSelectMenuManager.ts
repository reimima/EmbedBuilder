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
            case 'select_options':
                return await this.runSelectOptions();

            case 'select_fields':
                return await this.runSelectFields();
        }
    };

    private readonly runSelectOptions = async (): Promise<InteractionResponse | Message | void> => {
        const value = this.interaction.values[0] as ValueType,
            switcher = new EditorSwitcher(this.interaction, this.embed, value).init();

        if (this.embed.modeManager.mode === 'remove' && value !== 'fields')
            return await this.embed.removeProperty(value, this.interaction);

        try {
            await switcher[value as keyof typeof switcher]();
            this.embed.propLength += 1;
            if (value !== 'fields') {
                this.embed.propLength += 1;
                this.embed.alreadlyRemove[value] = false;
            }
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

    private readonly runSelectFields = async (): Promise<InteractionResponse | Message> => {
        const value = this.interaction.values[0];

        if (value === '-') return await this.interaction.update({ content: null });

        this.embed.selecting = Number(value);
        await this.interaction
            .reply({
                content: `You selected number of \`${Number(value) + 1}\` field.`,
            })
            .then(response => delayDelete([response]));

        return await this.embed.init(this.embed, { components: true, fields: true, change: false });
    };
}
