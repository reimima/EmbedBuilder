import { DEvent } from '../decorators';
import { ExEvent } from '../structures';

@DEvent({ name: 'error', once: false })
export default class extends ExEvent {
    public readonly run = (error: Error): void => this.logger.error('DJS Error -', error);
}
