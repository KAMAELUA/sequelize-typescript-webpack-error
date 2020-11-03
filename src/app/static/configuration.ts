import deepAssign from "deep-assign";
import fs from "fs";
import path from "path";

const confFilePath = require.resolve("../../../json/restapi.json");

class ConfigurationHandler {
    public database: IDatabaseConfiguration;
    public server: IServerConfigurations;

    constructor() {
        this.init(confFilePath);
    }

    public init(configFilePath: string) {
        let data: ConfigurationHandler = {} as ConfigurationHandler;

        try {
            data = JSON.parse(fs.readFileSync(configFilePath, {encoding: "utf8"}));
        } catch (e) {

        }

        this.database = {
            host: "localhost",
            database: "database",
            user: "root",
            pass: "root",
            dialect: "mysql",
            logging: true,
        };

        this.server = {
            host: "localhost",
            port: 8080,
            protocol: "http",
            assets_path: path.resolve(process.cwd(), "assets"),
            logs: {
                date_pattern: "YYYY-MM-DD",
                dirname: "logs",
                max_files: "14d",
                silent: false,
            },
        };

        deepAssign(this, data);
    }
}

interface IDatabaseConfiguration {
    host: string;
    port?: number;
    dialect: "mysql" | "mssql";
    schema?: string;

    database: string;
    user: string;
    pass: string;
    logging: boolean;
}

interface IServerConfigurations {
    host: string;
    protocol: "http" | "https";
    port: number;
    assets_path: string;
    logs: {
        dirname: string,
        date_pattern: string,
        max_files: string,
        silent: boolean,
    };
    key_file?: string;
    cert_file?: string;
}

const proxyHandler: ProxyHandler<ConfigurationHandler> = {
    get(target, name: keyof ConfigurationHandler) {
        return target[name];
    },
};

const underlyingObj = new ConfigurationHandler();

export const Configuration = new Proxy<ConfigurationHandler>(underlyingObj, proxyHandler);
