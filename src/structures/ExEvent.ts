import type { ClientEvents } from 'discord.js';

import { Structure } from './Structure';
import type { ExClient } from '../ExClient';

export abstract class ExEvent<E extends keyof ClientEvents = keyof ClientEvents> extends Structure {
    public constructor(
        protected readonly client: ExClient,
        public readonly data: Readonly<{
            name: E;
            once: boolean;
        }>,
    ) {
        super(data.name);
    }

    public abstract run(...args: ClientEvents[E]): unknown;
}

export type ExEventConstructor = new (...args: ConstructorParameters<typeof ExEvent>) => ExEvent;
