import { Output, splashscreen } from "./src/library/misc/logger";
import { Router } from "./src/library/web/route";
import { App } from "./src/library/web/server";

splashscreen();
const httpServer = new App();

import { Authentication } from "./src/library/auth/authentication";


httpServer.use(
    new Router("/test")
        .post("/create", async (req) =>{
            // @ts-ignore
            const formdata = await req.formData();

            const username = formdata.get("username") as string;
            const email = formdata.get("email") as string;
            const password = formdata.get("password") as string;
            console.log(username, password);
            let account = await Authentication.createAccount(username, password, email);
            console.log(account);
            return new Response("Account created");
        })
        .get("/get/:id", async (req, params) => {
            let {id} = params;
            return new Response(await Authentication.getAccount(id));
        })
        .post("/login", async (req, params) => {
            const formdata = await req.formData();

            const username = formdata.get("username") as string;
            const password = formdata.get("password") as string;
            let tokenPromise = await Authentication.login(username, password);
            if(tokenPromise == false) return new Response(JSON.stringify({ error: "Invalid username or password"}), {status: 401});
            // @ts-ignore
            let {token, timestamp} = tokenPromise;
            return new Response(JSON.stringify({ token}), {
                headers: {
                    "Content-Type": "application/json", 
                    "Set-Cookie": "token="+token+"; expires="+new Date(timestamp).toUTCString()
                }
            });
        })
        .post("/verify", async (req, params) => {
            const formdata = await req.formData();

            const username = formdata.get("username") as string;
            const password = formdata.get("password") as string;
            return new Response(JSON.stringify({ verified: await Authentication.verifyAccount(username, password)}));
        })
);

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