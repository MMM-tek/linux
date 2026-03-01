// Variables globales para el manejo de archivos
let currentFileHandle = null;
let fileContent = '';

const commands = {
    'help': () => "FILES:  open (select PC file), save (write to PC), cat (show content)\r\nEDIT:   nano (edit text), clear (clean screen)\r\nSYSTEM: date, whoami\r\n",
    
    'open': async () => {
        try {
            // Abre el selector de archivos nativo de Windows/Mac
            [currentFileHandle] = await window.showOpenFilePicker();
            const file = await currentFileHandle.getFile();
            fileContent = await file.text();
            return `\x1b[32mFile '${file.name}' loaded successfully.\x1b[0m\r\n`;
        } catch (e) { return "Operation cancelled.\r\n"; }
    },

    'save': async () => {
        if (!currentFileHandle) return "Error: No file opened. Use 'open' first.\r\n";
        try {
            // Solicita permiso de escritura al sistema operativo
            const writable = await currentFileHandle.createWritable();
            await writable.write(fileContent);
            await writable.close();
            return "\x1b[32mChanges saved to your computer.\x1b[0m\r\n";
        } catch (e) { return "Error: Permission denied or saving failed.\r\n"; }
    },

    'cat': () => (fileContent || "Buffer is empty") + "\r\n",
    'clear': (args, term) => { term.clear(); return ""; },
    'date': () => new Date().toString() + "\r\n",
    'whoami': () => "vscode-web-user\r\n"
};
