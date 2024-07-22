import { readdir } from "node:fs/promises";
import { Output } from "./logger";
import fs from "fs";

async function getTranslations() {
    // console.log(fs.existsSync(process.cwd()+"/config/translations"))
    // @ts-ignore
    const files = await readdir(process.cwd()+"/config/translations");
    let translations = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if(file.endsWith(".json")) {
            const lang = file.split(".")[0].split("-")[0].toLowerCase();
            translations[lang] = await Bun.file(`./config/translations/${file}`).json();
        }
    }
     // console.log(translations)
    let list = "";
    Object.keys(translations).forEach(lang => {
        list += lang + ", ";
    });
    list = list.slice(0, -2);
    Output.info(`Loading translations for ${list}`);
    return translations;
}


export const translations = getTranslations();