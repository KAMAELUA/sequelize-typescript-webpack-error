import "reflect-metadata";
import {container} from "tsyringe";
import {App} from "./src/app";

function launch() {
            setTimeout(() => {
            // const injector = ReflectiveInjector.resolveAndCreate(providers);
            const app = container.resolve(App);
            app.init().then();
        }, 1000);
}

launch();
