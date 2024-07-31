import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
// @ts-expect-error
import filesModuleHtml from "../frontend/modules/files.html" with { type: "text" };
import { Authentication } from "../library/auth/authentication";
import { SHA256_to_HEX } from "../library/auth/jwt";
import { Filesystem } from "../library/data/fileDatabase";

const uploadPath = "/uploads";

const router = new Router("/files")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return Response.redirect("/login");
        return next();
    })
    .get("/", async (req) => {


        return new Response(await translateString({file: filesModuleHtml, req}), contentType);
    })
    .get("/api/raw/:fileId", async (req, params) => {
        let { fileId } = params;
        return new Response(await Filesystem.readFileFromId(fileId));
    })
    .post("/api/folder/id", async (req) => {
        let formData = await req.formData();
        if(!formData.has("folderId")) return new Response(JSON.stringify({message: "No name specified"}), {status: 400});
        let folderId: unknown = formData.get("folderId");
        let folder = await Filesystem.getFolder(folderId as number);
        return new Response(JSON.stringify({folderId: folder.folderId, name: folder.name}), {status: 200});
    })
    .post("/api/folder", async (req) => {
        let userId = await Authentication.getUserIdFromJWT(req);
        if(userId == false) return new Response(JSON.stringify({message: "Invalid user"}), {status: 400});

        let formData = await req.formData();
        if(!formData.has("folder")) return new Response(JSON.stringify({message: "No name specified"}), {status: 400});
        
        if(formData.has("parent")) {
            // @ts-expect-error
            await Filesystem.createFolder(formData.get("folder"), userId, formData.get("parent"));
        } else {
            // @ts-expect-error
            await Filesystem.createFolder(formData.get("folder"), userId);
        }
        return new Response(JSON.stringify({status: 200, info: "Folder created"}), {status: 200});
    })
    .post('/api/file', async (req) => {
        let userId = await Authentication.getUserIdFromJWT(req);
        if(userId == false) return new Response(JSON.stringify({message: "Invalid user"}), {status: 400});

        let formData = await req.formData();
        if(formData.has("file") == false) return new Response(JSON.stringify({message: "No file uploaded"}), {status: 400});
        let file = formData.get("file") as File;
        if(file == undefined) return new Response(JSON.stringify({message: "Invalid file"}), {status: 400});

        if(formData.has("folder")) {
            let folder: unknown = formData.get("folder");
            // @ts-expect-error
            await Filesystem.uploadFile(file, userId, folder);
        } else {
            // @ts-expect-error
            await Filesystem.uploadFile(file, userId );
        }
        return new Response(JSON.stringify({status: 200, info: "File uploaded"}), {status: 200});
    })
    .delete("/api/file", async (req) => {
        let formData = await req.formData();
        if(formData.has("fileId") == false) return new Response(JSON.stringify({message: "No file specified"}), {status: 400});
        let file: unknown = formData.get("fileId");
        if(file == undefined) return new Response(JSON.stringify({message: "Invalid file"}), {status: 400});

        await Filesystem.deleteFile(file as number);
        return new Response(JSON.stringify({status: 200, info: "File deleted"}), {status: 200});
    })
    .get("/api/list", async (req) => {
        const querys = new URL(req.url).searchParams;
        let response;
        if(querys.has("folder")) {
            response = await Filesystem.getFilesFromFolder(parseInt(querys.get("folder") as string), await Authentication.getUserIdFromJWT(req) as number);
        } else {
            response = await Filesystem.getRootFiles(await Authentication.getUserIdFromJWT(req) as number);
        }
        return new Response(JSON.stringify(response), {status: 200});
    })
    .get("/length", async (req) => { 
        return new Response(JSON.stringify({filename:SHA256_to_HEX(Math.random().toString(36).substring(7)+Date.now().toString()).substring(0,25)}), {status: 200});
    });


export default router;