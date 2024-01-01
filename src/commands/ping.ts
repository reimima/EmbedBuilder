import { type ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

import { DCommand } from '../decorators';
import { ExCommand } from '../structures';

@DCommand({
    name: 'ping',
    description: 'Pong!',
})
export default class extends ExCommand {
    public readonly run = async (interaction: ChatInputCommandInteraction): Promise<void> => {
        await interaction.deferReply();

        await interaction.followUp({ content: '...' }).then(message =>
            message.edit({
                content: '',
                embeds: [
                    new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('Pong!')
                        .addFields(
                            {
                                name: 'WebSocket Ping',
                                value: `\`${interaction.client.ws.ping}ms\``,
                            },
                            {
                                name: 'API Endpoing Ping',
                                value: `\`${
                                    message.createdTimestamp - interaction.createdTimestamp
                                }ms\``,
                            },
                        ),
                ],
            }),
        );
    };
}
