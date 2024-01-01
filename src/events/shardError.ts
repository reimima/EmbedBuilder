import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'shardError', once: false })
export default class extends ExEvent {
    public readonly run = (error: Error, id: number): void =>
        this.logger.info(`Shard: ${id} has occured an error -`, error);
}
