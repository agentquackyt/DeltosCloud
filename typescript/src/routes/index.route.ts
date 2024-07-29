import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import indexHtml from "../frontend/html/index.html" with { type: "text" };
// @ts-expect-error
import loginHtml from "../frontend/html/login.html" with { type: "text" };
import manifestJson from "../frontend/html/manifest.json";
import { Authentication } from "../library/auth/authentication";


const router = new Router("/")
    .get("/", async (req) => {
        // validate login here

        return new Response(await translateString({ file: indexHtml, req }), contentType);
    })
    .get("/login", async (req) => {
        return new Response(await translateString({ file: loginHtml, req }), contentType);
    })
    .post("/login", async (req) => {
        const formdata = await req.formData();
        const username = formdata.get("username") as string;
        const password = formdata.get("password") as string;
        let tokenPromise = await Authentication.login(username, password);
        if (tokenPromise == false) return new Response(JSON.stringify({ error: "Invalid username or password" }), { status: 401 });
        // @ts-ignore
        let { token, timestamp } = tokenPromise;
        return new Response(JSON.stringify({ token }), {
            headers: {
                "Content-Type": "application/json",
                "Set-Cookie": "token=" + token + "; expires=" + new Date(timestamp).toUTCString()
            }
        });
    })
    .get('/manifest.json', (req) => {
        return new Response(JSON.stringify(manifestJson));
    });


export default router;