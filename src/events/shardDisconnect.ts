import type { CloseEvent } from 'discord.js';

import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'shardDisconnect', once: false })
export default class extends ExEvent {
    public readonly run = (event: CloseEvent, id: number): void =>
        this.logger.info(`Shard: ${id} has disconnected.`, `Code: ${event.code}.`);
}
