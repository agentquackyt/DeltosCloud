// index.js
window.addEventListener('load', load);
document.getElementById('app').addEventListener('htmx:afterSwap', updateTitle);
/**
 * @type {HTMLDivElement}
 */
const contextMenu = document.getElementById('contextmenu');
let selectedFile = {
    type: 'file',
    id: -1
};

document.addEventListener("contextmenu", (e) => {
    e.preventDefault();
});

document.addEventListener("click", (e) => {
    if (e.target !== contextMenu && !contextMenu.contains(e.target)) {
        contextMenu.style.display = 'none';
    }
});

/**
 * @param {KeyboardEvent} e
 */
document.addEventListener("keyup", (e) => {
    if (e.keyCode === 27) {
        contextMenu.style.display = 'none';
    }
});

function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx =
            e.clientX +
            document.body.scrollLeft +
            document.documentElement.scrollLeft;
        posy =
            e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
        x: posx,
        y: posy
    };
}

async function updateTitle() {
    if (location.pathname.startsWith('/f/')) {
        let formData = new FormData();
        formData.append('folderId', location.pathname.split("/").pop());
        let response = await fetch('/files/api/folder/id', { method: 'POST', body: formData })
        let { name } = await response.json();
        document.getElementById('app-title').innerHTML = /* HTML */ `<span class="grey-text">Folder / </span>` + name;
        document.title = 'Deltos Drive | ' + name;
    } else if (location.pathname.startsWith('/v/')) {
        let formData = new FormData();
        formData.append('fileId', location.pathname.split("/").pop());
        let response = await fetch('/files/api/file/id', { method: 'POST', body: formData })
        let { name } = await response.json();
        document.getElementById('app-title').innerHTML = /* HTML */ `<span class="grey-text">File / </span>` + name;
        document.title = 'Deltos Drive | ' + name;
    } else {
        document.getElementById('app-title').innerText = "Home";
        document.title = 'Deltos Drive';
    }

    document.querySelectorAll('.context-type-file').forEach(file => {
        let data = file.dataset;

        file.addEventListener('contextmenu', function (e) {
            selectedFile = {
                type: 'file',
                id: data.fileid
            }

            contextMenu.style.display = 'flex';
            let position = getPosition(e);
            contextMenu.style.left = position.x + 'px';
            contextMenu.style.top = position.y + 'px';

            console.log(selectedFile);
            e.preventDefault();
        }, false);
    });

    document.querySelectorAll('.context-type-folder').forEach(file => {
        let data = file.dataset;

        file.addEventListener('contextmenu', function (e) {
            selectedFile = {
                type: 'folder',
                id: data.folderid
            }

            contextMenu.style.display = 'flex';
            let position = getPosition(e);
            contextMenu.style.left = position.x + 'px';
            contextMenu.style.top = position.y + 'px';

            console.log(selectedFile);
            e.preventDefault();
        }, false);
    });
}


async function renameFile(fileId, newName) {
    let formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('newName', newName);
    let response = await fetch('/files/api/file/rename', { method: 'POST', body: formData });
    if (response.ok) {
        Prompts.showSnackbar('Renamed file');
        setTimeout(load, 1000);
    } else {
        Prompts.showSnackbar('Failed to rename file');
    }
}

async function deleteFile() {
    contextMenu.style.display = 'none';
    if (selectedFile.type === 'file') {
        if (!confirm('Are you sure you want to delete this file?')) {

        } else {
            /* delete the file */
            console.log('Deleting file', selectedFile.id);
            let formData = new FormData();
            formData.append('fileId', selectedFile.id);
            let response = await fetch('/files/api/file/delete', { method: 'POST', body: formData });
            if (response.ok) {
                Prompts.showSnackbar('Deleted file');
                setTimeout(load, 250);
            } else {
                Prompts.showSnackbar('Failed to delete file');
            } 
        }
    } else if (selectedFile.type === 'folder') {
        if (!confirm('Are you sure you want to delete this folder and all containing files?')) {
            /* do nothing */
        } else {
            /* delete the folder */            
            console.log('Deleting folder', selectedFile.id);
            let formData = new FormData();
            formData.append('folderId', selectedFile.id);
            let response = await fetch('/files/api/folder/delete', { method: 'POST', body: formData });
            if (response.ok) {
                Prompts.showSnackbar('Deleted folder');
                setTimeout(load, 250);
            } else {
                Prompts.showSnackbar('Failed to delete folder');
            }
        }
    }
}

async function load() {
    console.log(location.pathname);
    if (location.pathname.startsWith('/f/')) {
        await updateTitle();
        return htmx.ajax('GET', '/api/htmx/files/list.html?folder=' + location.pathname.split("/").pop(), { target: '#app', swap: 'innerHTML' })
    } else if (location.pathname.startsWith('/v/')) {
        await updateTitle();
        return htmx.ajax('GET', '/api/htmx/files/view.html?file=' + location.pathname.split("/").pop(), { target: '#app', swap: 'innerHTML' })
    }
    return htmx.ajax('GET', '/api/htmx/files/list.html', { target: '#app', swap: 'innerHTML' })
}


const Prompts = {
    show: () => {
        console.log('Prompt.show()');
        const prompt = document.getElementById('prompt');
        prompt.style.display = 'flex';
        // reset the input field
        document.forms['add-folder-form'].reset();

    },
    close: () => {
        console.log('Prompt.close()');
        const prompt = document.getElementById('prompt');
        prompt.style.display = 'none';
    },
    send: async (event) => {
        console.log('Prompt.send()', event);
        event.preventDefault();
        const form = document.forms['add-folder-form'];
        const formData = new FormData();
        formData.append('folder', form['folder'].value);
        if (location.pathname.startsWith('/f/')) {
            formData.append('parent', location.pathname.split("/").pop());
        }
        const response = await fetch('/files/api/folder', {
            method: 'POST',
            body: formData
        });
        if (response.ok) {
            Prompts.showSnackbar('Created folder');
            setTimeout(load, 1000);
        } else {
            Prompts.showSnackbar('Failed to create folder');
        }
        Prompts.close();
    },
    uploadDialog: () => {
        let input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.style.display = 'none';
        document.body.appendChild(input);
        Prompts.showSnackbar('Selecting files');
        input.onchange = async _ => {
            // you can use this method to get file and perform respective operations
            let files = Array.from(input.files);
            console.log(files);
            // perform database upload
            files.forEach(async file => {
                let formData = new FormData();
                formData.append('file', file);
                if (location.pathname.startsWith('/f/')) {
                    formData.append('folder', location.pathname.split("/").pop());
                }
                let response = await fetch('/files/api/file', {
                    method: 'POST',
                    body: formData
                })

                if (response.ok) {
                    Prompts.showSnackbar('Uploaded file');
                } else {
                    Prompts.showSnackbar('Failed to upload file');
                }
            });
            Prompts.showSnackbar('Uploaded files');
            document.body.removeChild(input);
            setTimeout(load, 1000);
        };
        input.click();
    },
    showSnackbar: (message) => {
        document.getElementById('snackbar').innerText = message;
        document.getElementById('snackbar').classList.add('show');
        console.log('showSnackbar', message);
        setTimeout(() => {
            document.getElementById('snackbar').classList.remove('show');
        }, 2000);
    }
}


function dragOverHandler(event) {
    event.preventDefault();
}

function dropHandler(event) {
    event.preventDefault();
    let files = Array.from(event.dataTransfer.files);
    console.log(files);
    // perform database upload
    files.forEach(async file => {
        let formData = new FormData();
        formData.append('file', file);
        if (location.pathname.startsWith('/f/')) {
            formData.append('folder', location.pathname.split("/").pop());
        }
        let response = await fetch('/files/api/file', {
            method: 'POST',
            body: formData
        })

        if (response.ok) {
            Prompts.showSnackbar('Uploaded file');
        } else {
            Prompts.showSnackbar('Failed to upload file');
        }
    });
    Prompts.showSnackbar('Start uploading files');
    setTimeout(load, 1000);
}

document.getElementById('add-folder-btn').addEventListener('click', Prompts.show);
