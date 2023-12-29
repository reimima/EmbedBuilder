import { Collection } from 'discord.js';
import { config } from 'dotenv';

import type { Client } from '../Client';
import type { Command } from '../structures';
import { loadModules } from '../utils';

config();

export class CommandManager extends Collection<string, Command> {
    public constructor(private readonly client: Client) {
        super();
    }

    public readonly registerAll = async (paths: string[]) =>
        (await loadModules<Command>(this.client, paths)).map(command =>
            this.set(command.data.name, command),
        );

    public readonly subscribe = async (): Promise<void> => {
        const devGuild = this.client.guilds.cache.get(process.env['DEV_GUILD_ID'] ?? '');

        if (!devGuild) throw new Error('Development guild was not found.');

        const subscribed = (await devGuild.commands.fetch()) ?? new Collection();

        const diffAdded = this.filter(c => !subscribed.find(s => s.name === c.data.name));
        const diffRemoved = subscribed.filter(s => !this.find(c => s.name === c.data.name));
        const diff = this.filter(
            c => !(subscribed.find(s => s.name === c.data.name)?.equals(c.data) ?? false),
        );

        await Promise.allSettled([
            ...diffAdded.mapValues(add => devGuild.commands.create(add.data)),
            ...diffRemoved.mapValues(remove => devGuild.commands.delete(remove.id)),
            ...diff.mapValues(change => {
                const id = subscribed.find(s => s.name === change.data.name)?.id;
                if (id) return devGuild.commands.edit(id, change.data);
                return;
            }),
        ]);
    };
}
