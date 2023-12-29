import type { Interaction } from 'discord.js';

import { DEvent } from '../decorators';
import { Event } from '../structures';

@DEvent({ name: 'interactionCreate', once: false })
export default class extends Event {
    public readonly run = async (interaction: Interaction): Promise<void> => {
        try {
            if (interaction.isChatInputCommand())
                await this.client.commandManager.get(interaction.commandName)?.run(interaction);
        } catch (e) {
            this.logger.error(e);
        }
    };
}
