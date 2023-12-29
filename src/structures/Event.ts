import type { ClientEvents } from 'discord.js';

import { Structure } from './Structure';
import type { Client } from '../Client';

export abstract class Event<E extends keyof ClientEvents = keyof ClientEvents> extends Structure {
    public constructor(
        protected readonly client: Client,
        public readonly data: Readonly<{
            name: E;
            once: boolean;
        }>,
    ) {
        super(data.name);
    }

    public abstract run(...args: ClientEvents[E]): unknown;
}

export type EventConstructor = new (...args: ConstructorParameters<typeof Event>) => Event;
