import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export class EditorModeManager {
    public mode: 'create' | 'delete' = 'create';

    private readonly buttons = {
        create: new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('create_mode')
                .setLabel('🔧 To Create Mode')
                .setStyle(ButtonStyle.Success),
        ),

        delete: new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId('delete_mode')
                .setLabel('💣 To Delete Mode')
                .setStyle(ButtonStyle.Danger),
        ),
    };

    public readonly generate = (change = false): ActionRowBuilder<ButtonBuilder> => {
        if (change) this.change();

        return this.buttons[this.mode === 'create' ? 'delete' : 'create'];
    };

    private readonly change = (): 'create' | 'delete' =>
        this.mode === 'create' ? (this.mode = 'delete') : (this.mode = 'create');
}
