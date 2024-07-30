// index.js

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
        input.onchange = _ => {
          // you can use this method to get file and perform respective operations
            let files = Array.from(input.files);
            console.log(files);
            // perform database upload

            Prompts.showSnackbar('Uploaded files');
            document.body.removeChild(input);
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

