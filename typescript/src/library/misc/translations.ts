import { readdir } from "node:fs/promises";
import { Output } from "./logger";
import fs from "fs";

async function getTranslations() {
    console.log(fs.existsSync(import.meta.dir+"/../../../config/translations"))
    // @ts-ignore
    const files = await readdir(import.meta.dir+"/../../../config/translations");
    let translations = {};
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if(file.endsWith(".json")) {
            const lang = file.split(".")[0].split("-")[0].toLowerCase();
            Output.info(`Loading translations for ${lang}`);
            translations[lang] = await Bun.file(`./config/translations/${file}`).json();
        }
    }
     // console.log(translations)
    return translations;
}


export const translations = getTranslations();