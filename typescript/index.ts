import { Output, splashscreen } from "./src/library/misc/logger";
import { Router } from "./src/library/web/route";
import { App } from "./src/library/web/server";

splashscreen();
const httpServer = new App();

httpServer.use(
    new Router("/t")
        .get("/", (req) => new Response("Hello World!"))
        .get("/test", (req) => new Response("Test"))
        .get("/test/:id", (req, params) => new Response("Test " + params.id))
);

import resRouter from "./src/routes/res.route";
httpServer.use(resRouter);

import indexRouter from "./src/routes/index.route";
httpServer.use(indexRouter);

httpServer.start({ port: 4000, callback: (port) => Output.info("Server started on port "+port) });


/*
    TODO: Add middleware option to the router
    for example:
    router.middleware((req, next) => {
        console.log("Middleware");
        next();
    })
    
    for validating the request, logging information, etc.
*/