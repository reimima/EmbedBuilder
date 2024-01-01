import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'shardReconnecting', once: false })
export default class extends ExEvent {
    public readonly run = (id: number): void =>
        this.logger.info(`Shard: ${id} is now reconnecting.`);
}
