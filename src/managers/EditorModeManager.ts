import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export class EditorModeManager {
    public mode: 'create' | 'remove' = 'create';

    private readonly buttons = {
        create: new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('mode_change')
                .setLabel('🔧 To Create Mode')
                .setStyle(ButtonStyle.Success),
        ),

        remove: new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('mode_change')
                .setLabel('💣 To Remove Mode')
                .setStyle(ButtonStyle.Danger),
        ),
    };

    public readonly generate = (change = false): ActionRowBuilder<ButtonBuilder> => {
        if (change) this.change();

        return this.buttons[this.mode === 'create' ? 'remove' : 'create'];
    };

    private readonly change = (): 'create' | 'remove' =>
        this.mode === 'create' ? (this.mode = 'remove') : (this.mode = 'create');
}
