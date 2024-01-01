import type { ApplicationCommandData, Interaction } from 'discord.js';

import { Structure } from './Structure';
import type { ExClient } from '../ExClient';

export abstract class ExCommand extends Structure {
    public constructor(
        protected readonly client: ExClient,
        public readonly data: ApplicationCommandData,
    ) {
        super(data.name);
    }

    public abstract run(interaction: Interaction): Promise<unknown>;
}

export type ExCommandConstructor = new (
    ...args: ConstructorParameters<typeof ExCommand>
) => ExCommand;
