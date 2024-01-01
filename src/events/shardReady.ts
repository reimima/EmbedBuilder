import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'shardReady', once: true })
export default class extends ExEvent {
    public readonly run = (id: number, unavailableGuilds: Set<string> | undefined): void => {
        const unavailable = unavailableGuilds?.size ?? 0;

        this.logger.info(
            `Shard: ${id} is now ready.`,
            unavailable === 0
                ? ''
                : `${unavailable} guild${unavailable === 1 ? ' is' : 's are'} unavailable ATM.`,
        );
    };
}
