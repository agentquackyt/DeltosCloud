import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import indexHtml from "../frontend/html/index.html" with { type: "text" };


const router = new Router("/")
    .get("/", async (req) => {
        // validate login here
        
        return new Response(await translateString({file: indexHtml, req}), contentType);
    })   


export default router;