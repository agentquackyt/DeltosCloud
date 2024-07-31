
// index.js
window.addEventListener('load', load);
htmx.get('#app').addEventListener('htmx:afterSwap', updateTitle);

async function updateTitle() {
    if (location.pathname.startsWith('/f/')) {
        let formData = new FormData();
        formData.append('folderId', location.pathname.split("/").pop());
        let response = await fetch('/files/api/folder/id', { method: 'POST', body: formData })
        let { name } = await response.json();
        document.getElementById('app-title').innerText = name;
    }
}

async function load() {
    console.log(location.pathname);
    if (location.pathname.startsWith('/f/')) {
        await updateTitle();
        return htmx.ajax('GET', '/api/htmx/files/list.html?folder=' + location.pathname.split("/").pop(), { target: '#app', swap: 'innerHTML' })
    }
    return htmx.ajax('GET', '/api/htmx/files/list.html', { target: '#app', swap: 'innerHTML' })
}

const Prompts = {
    show: () => {
        console.log('Prompt.show()');

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
                if(location.pathname.startsWith('/f/')) {
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
    showUploads: () => {

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

