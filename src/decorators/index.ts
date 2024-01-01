import type { ClassDecorator, NonAbstractConstructor } from './typings';
import type { ExCommand, ExCommandConstructor, ExEvent, ExEventConstructor } from '../structures';

export const DEvent =
    <T extends NonAbstractConstructor<ExEvent> = ExEventConstructor>(
        data: ExEvent['data'],
    ): ClassDecorator<T, T> =>
    target =>
        new Proxy(target, {
            construct: (_target, args: [ExEvent['client']]) => new _target(...args, data),
        });

export const DCommand =
    <T extends NonAbstractConstructor<ExCommand> = ExCommandConstructor>(
        data: ExCommand['data'],
    ): ClassDecorator<T, T> =>
    target =>
        new Proxy(target, {
            construct: (_target, args: [ExCommand['client']]) => new _target(...args, data),
        });
