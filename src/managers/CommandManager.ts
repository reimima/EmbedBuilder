import type {
    ApplicationCommand,
    ApplicationCommandManager,
    GuildApplicationCommandManager,
} from 'discord.js';
import { Collection } from 'discord.js';
import { config } from 'dotenv';

import type { ExClient } from '../ExClient';
import type { ExCommand } from '../structures';
import { loadModules } from '../utils';

config();

export class CommandManager extends Collection<string, ExCommand> {
    public constructor(private readonly client: ExClient) {
        super();
    }

    public readonly registerAll = async (paths: string[]) =>
        (await loadModules<ExCommand>(this.client, paths)).map(command =>
            this.set(command.data.name, command),
        );

    public readonly subscribe = async (mode: 'dev' | 'global'): Promise<void> => {
        let commands: ApplicationCommandManager | GuildApplicationCommandManager | undefined,
            subscribed: Collection<string, ApplicationCommand>;

        switch (mode) {
            case 'dev': {
                const devGuild = this.client.guilds.cache.get(this.client.storage.devGuildId);

                if (!devGuild) throw new Error('Development guild was not found.');

                commands = devGuild.commands;
                subscribed = (await commands.fetch()) ?? new Collection();
                break;
            }

            case 'global':
                commands = this.client.application?.commands;
                subscribed = (await commands?.fetch()) ?? new Collection();
                break;
        }

        const diffAdded = this.filter(c => !subscribed.find(s => s.name === c.data.name));
        const diffRemoved = subscribed.filter(s => !this.find(c => s.name === c.data.name));
        const diff = this.filter(
            c => !(subscribed.find(s => s.name === c.data.name)?.equals(c.data) ?? false),
        );

        await Promise.allSettled([
            ...diffAdded.mapValues(add => commands?.create(add.data)),
            ...diffRemoved.mapValues(remove => commands?.delete(remove.id)),
            ...diff.mapValues(change => {
                const id = subscribed.find(s => s.name === change.data.name)?.id;
                if (id) return commands?.edit(id, change.data);
                return;
            }),
        ]);
    };
}
