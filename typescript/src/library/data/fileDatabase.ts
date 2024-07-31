import { Database } from "bun:sqlite";
import { Output } from "../misc/logger";
import { SHA256_to_HEX } from "../auth/jwt";
import { BunFile } from "bun";
import { unlink } from "node:fs/promises";

const userDatabase = new Database(process.cwd()+"/config/database/files.sqlite", { create: true});

//  create prompt to create table users with an unique username and password and an unique IDID
await userDatabase.run("CREATE TABLE IF NOT EXISTS folder (folderId INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, parent NUMBER, owner NUMBER)");
await userDatabase.run("CREATE TABLE IF NOT EXISTS files (fileId INTEGER PRIMARY KEY AUTOINCREMENT, filename TEXT NOT NULL, path TEXT UNIQUE NOT NULL, folderId NUMBER, type TEXT NOT NULL, owner NUMBER NOT NULL, FOREIGN KEY (folderId) REFERENCES folder (folderId) )");

const uploadConfig = await Bun.file(process.cwd()+"/config/settings/files.json").json() as {
    $info: string,
    folder_path_for_upload: string,
    folder_paths_list: string[]
};

export type FileModel = {
    filename: string,
    path: string,
    folderId?: number,
    type: string,
    fileId: number,
    owner: number
};

export type FolderModel = {
    folderId: number,
    name: string,
    parent?: number,
    owner: number
};

export type FileResponseModel = {
    files: FileModel[],
    folders: FolderModel[],
    owner: number,
    folderName?: string
};

export const Filesystem = {
    createFolder: async (name: string, owner: number, parent?: number) => {
        if(parent == undefined) return await userDatabase.run("INSERT INTO folder (name, owner) VALUES (?, ?)", [name, owner]);
        await userDatabase.run("INSERT INTO folder (name, parent, owner) VALUES (?, ?, ?)", [name, parent, owner]);
    },
    getFolder: async (folderId: number): Promise<FolderModel> => {
        return await userDatabase.prepare("SELECT * FROM folder WHERE folderId = ?").get(folderId) as FolderModel;
    },
    createFile: async (filename: string, path: string, type: string, owner: number, folder?: number) => {
        if(folder == undefined) return await userDatabase.run("INSERT INTO files (filename, path, type, owner) VALUES (?, ?, ?, ?)", [filename, path, type, owner]);
        await userDatabase.run("INSERT INTO files (filename, path, folderId, type, owner) VALUES (?, ?, ?, ?, ?)", [filename, path, folder, type, owner]);
    },
    uploadFile: async (file: File, owner: number, folder?: number) => {
        let file_extension = file.name.split('.').pop();
        if(file_extension == undefined) return new Response(JSON.stringify({message: "Invalid file"}), {status: 400});
        let filename = SHA256_to_HEX(Math.random().toString(36).substring(7)+Date.now().toString()).substring(0,25);
        
        // save file to database SQLITE
        let path = uploadConfig.folder_path_for_upload+"/"+filename+'.'+file_extension;
        await Filesystem.createFile(file.name, path, file.type, owner, folder);
        await Bun.write(process.cwd()+path, file);
    },

    // get all files and folders from a folder
    getFilesFromFolder: async (folder: number, owner: number): Promise<FileResponseModel> => {
        let files = await userDatabase.prepare("SELECT * FROM files WHERE folderId = ? AND owner = ?").all(folder, owner) as FileModel[];
        let folders = await userDatabase.prepare("SELECT * FROM folder WHERE parent = ? AND owner = ?").all(folder, owner) as FolderModel[];
        let folderName = await userDatabase.prepare("SELECT name FROM folder WHERE folderId = ?").get(folder) as string;
        return {files, folders, owner, folderName};
    },
    getRootFiles: async (owner: number): Promise<FileResponseModel> => {
        let folders = await userDatabase.prepare("SELECT * FROM folder WHERE parent IS NULL AND owner = ?").all(owner) as FolderModel[];
        let files = await userDatabase.prepare("SELECT * FROM files WHERE folderId IS NULL AND owner = ?").all(owner) as FileModel[];
        return {files, folders, owner};
    },

    getFileFromId: async (id: number): Promise<FileModel> => {
        return await userDatabase.prepare("SELECT * FROM files WHERE fileId = ?").get(id) as FileModel;
    },
    readFileFromId: async (id: number): Promise<BunFile> => {
        let {path} = await userDatabase.prepare("SELECT path FROM files WHERE fileId = ?").get(id) as {path: string};
        return Bun.file(process.cwd()+path);
    },

    deleteFile: async (id: number) => {
        let {path} = await userDatabase.prepare("SELECT path FROM files WHERE fileId = ?").get(id) as {path: string};
        await userDatabase.prepare("DELETE FROM files WHERE fileId = ?").run(id);
        await unlink(process.cwd()+path);
    },

    renameFile: async (id: number, new_name: string) => {
        await userDatabase.prepare("UPDATE files SET filename = ? WHERE fileId = ?").run(new_name, id);
    }
};