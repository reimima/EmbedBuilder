import { inspect } from 'util';

import { Colors } from 'discord.js';
import type { BaseMessageOptions, DiscordAPIError, Interaction, TextChannel } from 'discord.js';

import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'interactionCreate', once: false })
export default class extends ExEvent {
    public readonly run = async (interaction: Interaction): Promise<void> => {
        try {
            if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand())
                await this.client.commandManager.get(interaction.commandName)?.run(interaction);
        } catch (e) {
            this.logger.error(e);

            const exec =
                    /^\/interactions\/\d+\/(?<token>.+)\/callback$/.exec((e as DiscordAPIError).url)
                        ?.groups ?? {},
                message: BaseMessageOptions = {
                    embeds: [
                        {
                            color: Colors.Red,
                            title: 'An Error Occured When Sending A Message',
                            description: inspect(e, { depth: 1, maxArrayLength: null })
                                .substring(0, 4096)
                                .replace(exec['token'] ?? 'ABCDEFGHIJKLMN', '*redacted*'),
                        },
                    ],
                };

            if (interaction.isChatInputCommand() || interaction.isMessageContextMenuCommand()) {
                if (interaction.replied || interaction.deferred) {
                    await interaction.editReply(message).catch(err => this.logger.error(err));
                } else {
                    await interaction.reply(message).catch(err => this.logger.error(err));
                }
            }

            await (
                this.client.channels.cache.get(
                    this.client.storage.errorLoggingChannelId,
                ) as TextChannel
            ).send(message);
        }
    };
}
