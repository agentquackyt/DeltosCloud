import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import indexHtml from "../frontend/html/index.html" with { type: "text" };
// @ts-expect-error
import loginHtml from "../frontend/html/login.html" with { type: "text" };
// @ts-expect-error
import registerHtml from "../frontend/html/register.html" with { type: "text" };
import manifestJson from "../frontend/html/manifest.json";
import { Authentication, reCAPTCHA } from "../library/auth/authentication";
import { User } from "../library/auth/authentication";


const router = new Router("/api/htmx")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return new Response("", {status: 401});
        return next();
    })
    .get("/files.html", async (req) => {
        let res = await Authentication.getUserFromJWT(req);
        if(res == false) return new Response("", {status: 401});
        const user = res as User;
        
        return new Response(/* HTML */`
            <h1>Hi ${user.username}</h1>
        
        `, contentType);
    })
    


export default router;