import { Router } from "../library/web/route";
import { contentType, getLanguages, translateString } from "../library/web/htmlViewEngine";
import { Authentication } from "../library/auth/authentication";
import { User } from "../library/auth/authentication";
import { FileModel, FileResponseModel, Filesystem, FolderModel } from "../library/data/fileDatabase";
import { BunFile } from "bun";
import { processMimeType } from "../library/data/mimeTypes";


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
                                <p><b>@size:TRANSLATE</b>: ${
                                    Math.round((((await Bun.file(process.cwd()+file.path) as BunFile).size / 1000000) + Number.EPSILON) * 100) / 100
                                    } MB</p>
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
                    <div data-folderid=${folder.folderId} hx-push-url="/f/${folder.folderId}" hx-get="/api/htmx/files/list.html?folder=${folder.folderId}" hx-swap="innerHTML" hx-trigger="click" hx-target="#app" class="file-card folder context-type-folder" >
                        <p>${folder.name}</p>
                    </div>
                `).join("")}
            </div>
            `}
            ${response.files.length == 0 ? "" : /* HTML */` 
            <h1>@files:TRANSLATE</h1>
            <div class="filelist item-list">
                ${response.files.map((file: FileModel) => /* HTML */`
                    <div data-fileid=${file.fileId} hx-push-url="/v/${file.fileId}" hx-get="/api/htmx/files/view.html?file=${file.fileId}" hx-swap="innerHTML" hx-trigger="click" hx-target="#app" class="file-card file context-type-file" >
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
            `}
            ${response.folders.length == 0 && response.files.length == 0 ? /* HTML */`
                <div class="centered">
                    <img src="/res/images/icon.svg" alt="" draggable="false"/>
                    <h2>@empty_drive:TRANSLATE</h2>
                    <h3 class="grey-text">@empty_drive_subtitle:TRANSLATE</h3>
                </div>
            `: ""}
        `;

        return new Response(await translateString({ file: html, req }), contentType);
    });
    

// @ts-expect-error
import settingsHtml from "../frontend/html/settings.html" with { type: "text" };
import { translations } from "../library/misc/translations";

router.get("/settings.html", async (req) => {
    

    const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });

    let translationDropdown = (country) => /* HTML */`
        <option value="${country}">${regionNamesInEnglish.of(country) == "EN" ? "United States" : regionNamesInEnglish.of(country)}</option>
    `;

    let dropdown = Object.keys(await translations).map(translationDropdown).join("");

    return new Response(await translateString({ file: settingsHtml, req, data: {test: "Hello World", languages: dropdown} }), contentType);
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



export default router;