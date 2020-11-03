import mysql2 from "mysql2";
import sequelize from "sequelize";
import {Sequelize} from "sequelize-typescript";
import tedious from "tedious";
import {injectable, Lifecycle, scoped} from "tsyringe";
import {Logger} from "winston";
import * as DbModels from "../models/database";
import {Configuration} from "../static/configuration";
import {Logger as StaticLogger} from "../static/logger";

@scoped(Lifecycle.ResolutionScoped)
@injectable()
export class DatabaseService {
    public sequelize: Sequelize;
    public dialect: "mysql" | "mssql";
    private logger: Logger = StaticLogger.child({logger: "DB", type: "DB"}).add(StaticLogger.databaseTransport);

    constructor() {
        this.init().then();
    }

    public async init() {
        if (Configuration.database.dialect === "mssql") {
            sequelize.DATE.prototype._stringify = function _stringify(date: any, options: any) {
                return this._applyTimezone(date, options).format("YYYY-MM-DD HH:mm:ss.SSS");
            };
        }

        this.sequelize = new Sequelize({
            database: Configuration.database.database,
            dialect: Configuration.database.dialect,
            dialectModule: Configuration.database.dialect === "mysql" ? mysql2 : tedious, // Needed to fix sequelize issues with WebPack
            username: Configuration.database.user,
            password: Configuration.database.pass,
            host: Configuration.database.host,
            port: Configuration.database.port ?? (Configuration.database.dialect === "mysql" ? 3306 : 1433),
            logging: Configuration.database.logging ? (sql) => this.logger.debug(sql) : false,

            dialectOptions: Configuration.database.dialect === "mssql" ? {
                options: {
                    trustServerCertificate: true,
                    appName: "RegistryRESTServer",
                },
            } : null,
        });

        this.dialect = Configuration.database.dialect;
        this.sequelize.addModels(Object.values(DbModels));
    }
}
