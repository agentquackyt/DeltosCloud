import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import filesModuleHtml from "../frontend/modules/files.html" with { type: "text" };
import { Authentication } from "../library/auth/authentication";


const router = new Router("/files")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return Response.redirect("/login");
        return next();
    })
    .get("/", async (req) => {
        
        return new Response(await translateString({file: filesModuleHtml, req}), contentType);
    })
    .get('/list', (req) => {
        return new Response("<h1>List of files</h1>");
    })


export default router;