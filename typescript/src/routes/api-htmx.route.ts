import { Router } from "../library/web/route";
import { contentType, translateString } from "../library/web/htmlViewEngine";
import { Authentication } from "../library/auth/authentication";
import { User } from "../library/auth/authentication";
import { FileModel, FileResponseModel, Filesystem, FolderModel } from "../library/data/fileDatabase";


const router = new Router("/api/htmx")
    .use(async (req, next) => {
        if (await Authentication.verifyJWT(req) == false) return new Response("", {status: 401});
        return next();
    })
    .get("/files/view.html", async (req) => {
        let res = await Authentication.getUserFromJWT(req);
        const user = res as User;
        const querys = new URL(req.url).searchParams;
        if(querys.has("file")) {
            let file = await Filesystem.getFileFromId(parseInt(querys.get("file") as string)) as FileModel;
            if(file != null) {
                if(file.owner != user.id) return new Response("", {status: 403});
                let html = /* HTML */ `
                    <div class="file-view">
                        <div class="file-info">
                                <button ${file.folderId ? 'hx-push-url="/f/'+file.folderId+'"' : 'hx-push-url="/"'} hx-get="/api/htmx/files/list.html${file.folderId ? '?folder='+file.folderId : ""}" hx-swap="innerHTML" hx-trigger="click" hx-target="#app" class="material-symbols-rounded goBack">arrow_back</button>
                                <p><b>@filename:TRANSLATE</b>: ${file.filename}</p>
                                <p><b>@type:TRANSLATE</b>: ${file.type}</p>
                                <a href="/files/api/raw/${file.fileId}" target="_blank"><span class="material-symbols-rounded">download</span><b>@download:TRANSLATE</b></a>
                        </div>
                        <div class="file-preview">
                            ${mimeTypeRender(file.type, file)}
                        </div>
                    </div>
                `;
                return new Response(await translateString({ file: html, req }), contentType);
        }
        }

        return new Response("", {status: 404, statusText: "Not Found"});
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
    
function mimeTypeRender(mimeType: string, file: FileModel): string {
    if(mimeType.startsWith("image")) return /* HTML */`
        <img src="/files/api/raw/${file.fileId}" alt="Preview" />
    `;
    if(mimeType.startsWith("video")) return /* HTML */`
        <video src="/files/api/raw/${file.fileId}" controls></video>
    `;
    if(mimeType.startsWith("audio")) return /* HTML */`
        <audio src="/files/api/raw/${file.fileId}" controls></audio>
    `;
    return /* HTML */`
        <p class="material-symbols-rounded" style="font-size: 75px !important; max-width: 75px">${processMimeType(mimeType)}</p>
    `;
}

function processMimeType(mimeType: string): string {
    if(mimeType.startsWith("image")) return "image";
    if(mimeType.startsWith("video")) return "movie";
    if(mimeType.startsWith("audio")) return "library_music";
    if(mimeType.startsWith("text")) return "article";
    if(mimeType.startsWith("application/pdf")) return "picture_as_pdf";
    if(mimeType.startsWith("application/json")) return "data_object";
    if(mimeType.startsWith("application/zip")) return "archive";
    if(mimeType.startsWith("application/x-rar")) return "archive";
    if(mimeType.startsWith("application/x-7z-compressed")) return "archive";
    if(mimeType.startsWith("application/x-msdownload")) return "terminal";
    return "description";
}

export default router;