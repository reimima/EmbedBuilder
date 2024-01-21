import type {
    ButtonInteraction,
    ChatInputCommandInteraction,
    StringSelectMenuInteraction,
} from 'discord.js';

import { DCommand } from '../decorators';
import { EditorSwitcher, EmbedEditer, ExCommand } from '../structures';

@DCommand({
    name: 'build',
    description: 'Make your own embed!',
})
export default class extends ExCommand {
    private embed!: EmbedEditer;

    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        this.embed = new EmbedEditer(interaction);

        const collecter = (await this.embed.init()).createMessageComponentCollector({
            filter: collected =>
                (collected.isStringSelectMenu() || collected.isButton()) &&
                collected.user.id === interaction.user.id,
        });

        collecter.on('collect', async interaction => {
            if (interaction.isStringSelectMenu()) {
                await this.runStringSelectMenu(interaction);
            } else if (interaction.isButton()) {
                await this.runButton(interaction);
            }
        });
    };

    public readonly runStringSelectMenu = async (
        interaction: StringSelectMenuInteraction,
    ): Promise<void> => {
        const value = interaction.values[0] as string,
            switcher = new EditorSwitcher(interaction, this.embed, value).init();

        await switcher[value as keyof typeof switcher]();
    };

    public readonly runButton = async (interaction: ButtonInteraction): Promise<void> => {
        await interaction.deferReply();
    };
}
