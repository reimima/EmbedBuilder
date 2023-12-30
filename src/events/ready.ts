import type { Client } from 'discord.js';

import { DEvent } from '../decorators';
import { Event } from '../structures';

@DEvent({ name: 'ready', once: true })
export default class extends Event {
    public readonly run = async (client: Client<true>): Promise<void> => {
        this.logger.info('Succesfully logged in and is Ready.');
        this.logger.trace(
            `Cached ${this.client.guilds.cache.size} guild${
                client.guilds.cache.size <= 1 ? '' : 's'
            }.`,
        );

        this.logger.info('Starting to subscribe commands to Discord Server.');
        await this.client.commandManager
            .subscribe('dev')
            .then(() => this.logger.info('Succesfully subscribed commands to Discord Server.'))
            .catch(e => this.logger.error('There was an error subscribing -', e));
    };
}
