import {
    type ButtonInteraction,
    type ChatInputCommandInteraction,
    EmbedBuilder,
    type StringSelectMenuInteraction,
} from 'discord.js';

import { DCommand } from '../decorators';
import { EditorSwitcher, EmbedEditer, ExCommand } from '../structures';

@DCommand({
    name: 'embed',
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

        try {
            await switcher[value as keyof typeof switcher]();
        } catch (e) {
            this.logger.error(e);

            await this.embed.init(
                new EmbedBuilder()
                    .setColor('Red')
                    .setTitle('An unexpected error has occurred')
                    .setDescription('Please retry.'),
                { appendedComponents: false, appendedFiles: false },
            );
        }
    };

    public readonly runButton = async (interaction: ButtonInteraction): Promise<void> => {
        await interaction.deferReply();
    };
}
