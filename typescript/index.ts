import { Output, splashscreen } from "./src/library/misc/logger";
import { Router } from "./src/library/web/route";
import { App } from "./src/library/web/server";

splashscreen();
const httpServer = new App();

import { Authentication } from "./src/library/auth/authentication";


httpServer.use(
    new Router("/test")
        .get("/get/:id", async (req, params) => {
            let {id} = params;
            return new Response(JSON.stringify(await Authentication.getAccount(id)));
        })
        .get("/get", async (req) => {
            // Get using JWT
            let response = await Authentication.getUserFromJWT(req);

            return new Response(JSON.stringify(response));
        })
);

import apiHtmxRouter from "./src/routes/api-htmx.route";
httpServer.use(apiHtmxRouter);

import resRouter from "./src/routes/res.route";
httpServer.use(resRouter);

import filesRouter from "./src/routes/files.route";
httpServer.use(filesRouter);

import indexRouter from "./src/routes/index.route";
httpServer.use(indexRouter);


httpServer.start({ port: 3000, callback: (port) => Output.info("Server started on port "+port) });


/*
    TODO: Add middleware option to the router
    for example:
    router.middleware((req, next) => {
        console.log("Middleware");
        next();
    })
    
    for validating the request, logging information, etc.
*/