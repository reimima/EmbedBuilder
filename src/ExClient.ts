import { Client as DJSClient } from 'discord.js';
import { config } from 'dotenv';
import log4js from 'log4js';

import { CommandManager } from './managers';
import type { ExEvent } from './structures';
import { directoryName, loadModules } from './utils';
import { Database } from '../database';

config();

// eslint-disable-next-line import/no-named-as-default-member
const { configure, getLogger } = log4js;

export class ExClient extends DJSClient {
    public readonly logger = getLogger('ExClient');

    public readonly commandManager: CommandManager;

    public readonly storage = {
        devGuildId: process.env['DEV_GUILD_ID'] ?? '',
    };

    public readonly db: Database = new Database();

    public constructor() {
        super({
            intents: ['Guilds', 'GuildIntegrations'],
            allowedMentions: { repliedUser: false },
        });

        configure({
            appenders: {
                console: {
                    type: 'stdout',
                    layout: {
                        type: 'pattern',
                        pattern: '%[[%d]%] %[[%p]%] %[[%c]%]: %m',
                    },
                },
            },
            categories: {
                default: {
                    appenders: ['console'],
                    level: 'info',
                    enableCallStack: true,
                },
            },
        });

        this.commandManager = new CommandManager(this);

        this.db.pool.getConnection((err, conn) => {
            conn.query(
                'CREATE TABLE IF NOT EXISTS users (id VARCHAR(19) NOT NULL PRIMARY KEY, data MEDIUMTEXT)',
                err => {
                    if (err) this.logger.error(err);
                    conn.release();
                },
            );

            if (err) this.logger.error(err);
        });
    }

    public readonly build = async (): Promise<void> => {
        this.logger.info('Initializing...');

        try {
            (
                await loadModules<ExEvent>(this, [
                    `${directoryName(import.meta.url)}/events/**/*.ts`,
                ])
            ).forEach(event =>
                this[event.data.once ? 'once' : 'on'](event.data.name, async (...args) => {
                    await event.run(...args);
                }),
            );
            await this.commandManager.registerAll([
                `${directoryName(import.meta.url)}/commands/**/*.ts`,
            ]);
        } catch (e) {
            this.logger.error(e);
        }

        this.logger.info('Initialize done. Logging in...');

        await super.login(process.env['DISCORD_TOKEN']).catch(e => this.logger.error(e));
    };

    public readonly shutdown = async (): Promise<void> => {
        this.logger.info('Shutting down...');

        this.removeAllListeners();
        await this.destroy();

        process.exit();
    };
}
