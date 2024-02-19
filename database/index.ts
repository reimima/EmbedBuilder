import { promisify } from 'util';

import { config } from 'dotenv';
import type { Pool, PoolConnection, QueryOptions } from 'mysql2';
import { createPool } from 'mysql2';

config();

export type User = {
    id: number;
    data: string | null;
};

export class Database {
    public readonly pool: Pool = createPool({
        host: String(process.env['MYSQL_HOST']),
        user: String(process.env['MYSQL_USER']),
        password: String(process.env['MYSQL_PASSWORD']),
        database: String(process.env['MYSQL_DATABASE_NAME']),
    });

    public readonly exec = promisify(this.pool.query).bind(this.pool) as (
        statement: QueryOptions,
    ) => Promise<User[]>;

    public readonly connection = async (): Promise<PoolConnection> =>
        await promisify(this.pool.getConnection).bind(this.pool)();

    public readonly query = (
        connection: PoolConnection,
        statement: QueryOptions,
    ): Promise<unknown> => promisify(connection.query).bind(connection)(statement);

    public readonly transaction = (connection: PoolConnection): Promise<void> =>
        new Promise<void>((resolve, reject) => {
            connection.beginTransaction(error => {
                if (error) reject(error);
                else resolve();
            });
        });

    public readonly commit = (connection: PoolConnection): Promise<void> =>
        new Promise<void>((resolve, reject) => {
            connection.commit(error => {
                if (error) reject(error);
                else resolve();
            });
        });

    public readonly rollback = (connection: PoolConnection): Promise<unknown> =>
        new Promise(resolve => {
            connection.rollback(error => resolve(error));
        });
}
