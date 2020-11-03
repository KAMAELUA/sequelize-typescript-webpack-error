import {injectable, Lifecycle, scoped} from "tsyringe";
import {UserModel} from "./app/models/database";
import {
    DatabaseService,
} from "./app/services";

@scoped(Lifecycle.ResolutionScoped)
@injectable()
export class App {

    constructor(
        private databaseService: DatabaseService,
    ) {}

    public async init() {
        UserModel.findAll().then();
    }
}
