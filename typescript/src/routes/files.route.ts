import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import filesModuleHtml from "../frontend/modules/files.html" with { type: "text" };
import { Authentication } from "../library/auth/authentication";
import { SHA256_to_HEX } from "../library/auth/jwt";

const uploadPath = "/uploads";

const router = new Router("/files")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return Response.redirect("/login");
        return next();
    })
    .get("/", async (req) => {


        return new Response(await translateString({file: filesModuleHtml, req}), contentType);
    })
    .post('/api/upload', async (req) => {
        let formData = await req.formData();
        if(formData.has("file") == false) return new Response(JSON.stringify({message: "No file uploaded"}), {status: 400});
        let file = formData.get("file") as File;
        let file_extension = file.name.split('.').pop();
        if(file_extension == undefined) return new Response(JSON.stringify({message: "Invalid file"}), {status: 400});
        let filename = SHA256_to_HEX(Math.random().toString(36).substring(7)+Date.now().toString()).substring(0,25);
        
        // save file to database SQLITE

        // await Bun.write(process.cwd()+uploadPath+filename+'.'+file_extension, file);

        return new Response(JSON.stringify({message: "File uploaded"}), {status: 200});
    })
    .get("/length", async (req) => { 
        return new Response(JSON.stringify({filename:SHA256_to_HEX(Math.random().toString(36).substring(7)+Date.now().toString()).substring(0,25)}), {status: 200});
    });


export default router;