import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'shardResume', once: false })
export default class extends ExEvent {
    public readonly run = (id: number, replayedEvents: number): void =>
        this.logger.info(`Shard: ${id} has resumed. Replayed: ${replayedEvents}.`);
}
