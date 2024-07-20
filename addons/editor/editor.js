let hasBeenSaved = true;

function save() {
    let text = Cloud.window.getElement("text_field").value;
    console.log("[Editor] saving ", Cloud.data.fileID, " with text: ", text);
    Cloud.service.updateFile(Cloud.data.fileID, text);
    hasBeenSaved = true;
    Cloud.window.writeInnerText("save_status", "");
}

async function load() {
    console.log("[Editor] loading", Cloud.data.fileID);
    Cloud.window.getElement("text_field").addEventListener("input", onType);
    let text = await Cloud.service.getText(Cloud.data.fileID);
    console.log("[Editor] text:", text);
    Cloud.window.writeInnerText("text_field", text);
    Cloud.window.writeInnerText("save_status", "");
    Cloud.window.shortcuts.register(true, false, "s", save);

}

function onType() {
    hasBeenSaved = false;
    Cloud.window.writeInnerText("save_status", "Unsaved changes");
}

export {
    load,
    save
};