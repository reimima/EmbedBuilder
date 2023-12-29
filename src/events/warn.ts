import { DEvent } from '../decorators';
import { Event } from '../structures';

@DEvent({ name: 'warn', once: false })
export default class extends Event {
    public readonly run = (message: string): void => {
        this.logger.warn('DJS Warning -', message);
    };
}
