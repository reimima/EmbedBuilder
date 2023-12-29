import type { ClassDecorator, NonAbstractConstructor } from './typings';
import type { Command, CommandConstructor, Event, EventConstructor } from '../structures';

export const DEvent =
    <T extends NonAbstractConstructor<Event> = EventConstructor>(
        data: Event['data'],
    ): ClassDecorator<T, T> =>
    target =>
        new Proxy(target, {
            construct: (_target, args: [Event['client']]) => new _target(...args, data),
        });

export const DCommand =
    <T extends NonAbstractConstructor<Command> = CommandConstructor>(
        data: Command['data'],
    ): ClassDecorator<T, T> =>
    target =>
        new Proxy(target, {
            construct: (_target, args: [Command['client']]) => new _target(...args, data),
        });
