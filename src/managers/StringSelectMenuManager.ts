import type { StringSelectMenuInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { EditorSwitcher, type EmbedEditer, Structure } from '../structures';
import { delayDelete } from '../utils';

export class StringSelectMenuManager extends Structure {
    public constructor(
        private readonly interaction: StringSelectMenuInteraction,
        private readonly embed: EmbedEditer,
    ) {
        super('StringSelectMenuManager');
    }

    public readonly init = async (): Promise<void> => {
        switch (this.interaction.customId) {
            case 'select-options':
                return await this.runSelectOptions();

            case 'select-fields':
                return await this.runSelectFields();
        }
    };

    private readonly runSelectOptions = async () => {
        const value = this.interaction.values[0] as string,
            switcher = new EditorSwitcher(this.interaction, this.embed, value).init();

        try {
            await switcher[value as keyof typeof switcher]();
        } catch (e) {
            this.logger.error(e);

            await this.embed.init(
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('An unexpected error has occurred')
                    .setDescription('Please retry.'),
                { components: false, files: false, fields: false },
            );
        }
    };

    private readonly runSelectFields = async (): Promise<void> => {
        const value = Number(this.interaction.values[0]);

        this.embed.selecting.set(this.interaction.user.id, value);

        await this.interaction
            .reply({
                content: `You selected number of \`${value + 1}\` field.`,
            })
            .then(response => delayDelete([response]));

        await this.embed.init(this.embed, { components: true, files: true, fields: true });
    };
}
