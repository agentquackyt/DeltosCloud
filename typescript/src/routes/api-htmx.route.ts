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
import { FileModel, FileResponseModel, Filesystem, FolderModel } from "../library/data/fileDatabase";


const router = new Router("/api/htmx")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return new Response("", {status: 401});
        return next();
    })
    .get("/files.html", async (req) => {
        let res = await Authentication.getUserFromJWT(req);
        const user = res as User;
        
        return new Response(/* HTML */`
            <h1>Hi ${user.username}</h1>
        
        `, contentType);
    })
    .get("/files/list.html", async (req) => {
        let userID = await Authentication.getUserIdFromJWT(req) as number;
        const querys = new URL(req.url).searchParams;
        let response: FileResponseModel;
        if(querys.has("folder")) {
            response = await Filesystem.getFilesFromFolder(parseInt(querys.get("folder") as string), userID);
        } else {
            response = await Filesystem.getRootFiles(userID);
        }

        console.log(response);

        let html = /* HTML */ `
            ${response.folders.length == 0 ? "" : /* HTML */` 
            <h1>@folder:TRANSLATE</h1>
            
            <div class="folderlist item-list">
                ${response.folders.map((folder: FolderModel) => /* HTML */`
                    <div hx-push-url="/f/${folder.folderId}" hx-get="/api/htmx/files/list.html?folder=${folder.folderId}" hx-swap="innerHTML" hx-trigger="click" hx-target="#app" class="file-card folder" >
                        <p>${folder.name}</p>
                    </div>
                `).join("")}
            </div>
            `}
            <h1>@files:TRANSLATE</h1>
            <div class="filelist item-list">
                ${response.files.map((file: FileModel) => /* HTML */`
                    <div hx-push-url="/v/${file.fileId}" hx-get="/api/htmx/files/view.html?file=${file.fileId}" hx-swap="innerHTML" hx-trigger="click" hx-target="#app" class="file-card file" >
                        <p class="file-name">${file.filename}</p>
                        <div class="preview-image">
                            ${file.type.startsWith("image") ? /* HTML */`
                                <img src="/files/api/raw/${file.fileId}" alt="Preview" />
                                ` : /* HTML */`
                                <p class="material-symbols-rounded" style="font-size: 75px !important; max-width: 75px">${processMimeType(file.type)}</p>
                                `}
                            
                        </div>
                    </div>
                `).join("")}
            </div>
        `;

        return new Response(await translateString({ file: html, req }), contentType);
    });
    
function processMimeType(mimeType: string): string {
    if(mimeType.startsWith("image")) return "image";
    if(mimeType.startsWith("video")) return "movie";
    if(mimeType.startsWith("audio")) return "library_music";
    if(mimeType.startsWith("text")) return "article";
    return "description";
}

export default router;