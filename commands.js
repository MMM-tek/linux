let fileHandle = null; // Referencia al archivo real del PC

const commands = {
    'help': () => "REAL FILES: open (select file), save (save edits)\nEDIT: nano (edit buffer), cat (show content)\nMEDIA: view (show image), close (hide image)\nSYSTEM: clear, date, whoami",

    // Seleccionar un archivo real del ordenador
    'open': async (args, term) => {
        try {
            [fileHandle] = await window.showOpenFilePicker();
            const file = await fileHandle.getFile();
            const content = await file.text();
            window.currentFileContent = content; // Guardamos en memoria
            return `\x1b[32mFile '${file.name}' loaded into buffer.\x1b[0m\r\n`;
        } catch (e) { return "Open cancelled or error.\r\n"; }
    },

    // Guardar los cambios en el archivo real
    'save': async () => {
        if (!fileHandle) return "No file opened. Use 'open' first.\r\n";
        try {
            const writable = await fileHandle.createWritable();
            await writable.write(window.currentFileContent);
            await writable.close();
            return "\x1b[32mChanges saved to disk.\x1b[0m\r\n";
        } catch (e) { return "Permission denied to save.\r\n"; }
    },

    'nano': () => ({ mode: 'edit' }),

    'cat': () => (window.currentFileContent || "Buffer empty") + "\r\n",

    // Ver imágenes reales
    'view': async () => {
        try {
            const [handle] = await window.showOpenFilePicker({ types:} }] });
            const file = await handle.getFile();
            const url = URL.createObjectURL(file);
            const img = document.getElementById('img-viewer');
            img.src = url;
            img.style.display = 'block';
            return "\x1b[35mShowing image... type 'close' to hide.\x1b[0m\r\n";
        } catch (e) { return "Error opening image.\r\n"; }
    },

    'close': () => {
        document.getElementById('img-viewer').style.display = 'none';
        return "Image closed.\r\n";
    },

    'clear': (args, term) => { term.clear(); return ""; },
    'date': () => new Date().toString() + "\r\n",
    'whoami': () => "user@vscode-pc\r\n"
};
