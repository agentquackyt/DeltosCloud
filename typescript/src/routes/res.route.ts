import { Router } from "../library/web/route";
// @ts-expect-error
import iconSvg from "../frontend/images/icon.svg" with { type: "text" };
// @ts-expect-error
import icon2Svg from "../frontend/images/icon2.svg" with { type: "text" };

// @ts-expect-error
import preview_narrow from "../frontend/images/preview_narrow.png" with { type: "file" };
// @ts-expect-error
import preview_wide from "../frontend/images/preview_wide.png" with { type: "file" };
//style

// @ts-expect-error
import themeCss from "../frontend/css/theme.css" with { type: "text" };
// @ts-expect-error
import indexCss from "../frontend/css/index.css" with { type: "text" };
// @ts-expect-error
import iconsCss from "../frontend/css/icons.css" with { type: "text" };

// @ts-expect-error
import cacheJs from "../frontend/javascript/cache.js" with { type: "text" };
// @ts-expect-error
import indexJs from "../frontend/javascript/index.js" with { type: "text" };


const router = new Router("/res")
    .get("/images/:id", async (req, params) => {
        switch (params.id) {
            case "icon.svg": return new Response(icon2Svg, { headers: { "Content-Type": "image/svg+xml" } });
            case "icon2.svg": return new Response(iconSvg, { headers: { "Content-Type": "image/svg+xml" } });
            case "preview_narrow.png": return new Response(Bun.file(preview_narrow), { headers: { "Content-Type": "image/png" } });
            case "preview_wide.png": return new Response(Bun.file(preview_wide), { headers: { "Content-Type": "image/png" } });
        }
        return new Response("Image " + params.id);
    })
    .get("/css/:id", async (req, params) => {
        switch (params.id) {
            case "index.css": return new Response(indexCss, { headers: { "Content-Type": "text/css" } });
            case "theme.css": return new Response(themeCss, { headers: { "Content-Type": "text/css" } });
            case "icons.css": return new Response(iconsCss, { headers: { "Content-Type": "text/css" } });
        }
        return Response.json({ error: "Style " + params.id + " not found" }, { status: 404 });
    })
    .get("/js/:id", async (req, params) => {
        switch (params.id) {
            case "cache-worker.js": return new Response(cacheJs, { headers: { "Content-Type": "application/javascript" } });
            case "index.js": return new Response(indexJs, { headers: { "Content-Type": "application/javascript" } });
        }
        return Response.json({ error: "JavaScript " + params.id + " not found" }, { status: 404 });
    })
    .get("/fonts/:id", async (req, params) => {
        switch (params.id) {
            case "GoogleSans.woff": return new Response(Bun.file(process.cwd()+"/src/frontend/font/GoogleSans.woff"), { headers: { "Content-Type": "font/woff" } });
            case "icons.woff2": return new Response(Bun.file(process.cwd()+"/src/frontend/font/icons.woff2"), { headers: { "Content-Type": "font/woff2" }})
        }
        return new Response("Font " + params.id);
    })
    

export default router;