import { DEvent } from '../decorators';
import { Event } from '../structures';

@DEvent({ name: 'error', once: false })
export default class extends Event {
    public readonly run = (error: Error): void => {
        this.logger.error('DJS Error -', error);
    };
}
