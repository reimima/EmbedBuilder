import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'warn', once: false })
export default class extends ExEvent {
    public readonly run = (message: string): void => this.logger.warn('DJS Warning -', message);
}
