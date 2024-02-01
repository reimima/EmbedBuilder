import { EmbedBuilder, type StringSelectMenuInteraction } from 'discord.js';

import { EditorSwitcher, type EmbedEditer, Structure } from '../structures';

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
                return;
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
}
