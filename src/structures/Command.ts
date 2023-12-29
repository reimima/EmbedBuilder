import type { ApplicationCommandData, Interaction } from 'discord.js';

import { Structure } from './Structure';
import type { Client } from '../Client';

export abstract class Command extends Structure {
    public constructor(
        protected readonly client: Client,
        public readonly data: ApplicationCommandData,
    ) {
        super(data.name);
    }

    public abstract run(interaction: Interaction): Promise<unknown>;
}

export type CommandConstructor = new (...args: ConstructorParameters<typeof Command>) => Command;
