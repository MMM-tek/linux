window.onload = function() {
    const term = new window.Terminal({
        cursorBlink: true,
        convertEol: true,
        theme: { background: '#000000', foreground: '#ffffff' },
        fontSize: 16
    });

    term.open(document.getElementById('terminal'));
    term.focus();

    let inputBuffer = '';
    let isEditing = false;
    const prompt = () => term.write(`\x1b[32muser@vscode\x1b[0m:\x1b[34m~\x1b[0m$ `);
    
    prompt(); // Sin títulos al inicio

    term.onData(async (data) => {
        // --- LÓGICA MODO NANO ---
        if (isEditing) {
            const charCode = data.charCodeAt(0);
            if (charCode === 24) { // CTRL+X para salir
                isEditing = false;
                term.clear();
                term.write("Nano closed. Use 'save' to apply changes to PC.\r\n");
                prompt();
            } else if (charCode === 13) { // ENTER
                fileContent += '\n'; term.write('\n');
            } else if (charCode === 127) { // BACKSPACE
                if (fileContent.length > 0) {
                    fileContent = fileContent.slice(0, -1);
                    term.write('\b \b');
                }
            } else {
                fileContent += data;
                term.write(data);
            }
            return;
        }

        // --- LÓGICA MODO TERMINAL ---
        if (data.charCodeAt(0) === 13) { // ENTER
            term.write('\r\n');
            const cmd = inputBuffer.trim().toLowerCase();

            if (cmd === 'nano') {
                isEditing = true;
                term.clear();
                term.write("\x1b[47;30m GNU nano 5.4 \x1b[0m (CTRL+X to Save & Exit)\r\n\r\n");
                term.write(fileContent);
            } else if (commands[cmd]) {
                const result = await commands[cmd](null, term);
                term.write(result);
                prompt();
            } else if (cmd !== "") {
                term.write(`bash: ${cmd}: command not found\r\n`);
                prompt();
            } else {
                prompt();
            }
            inputBuffer = '';
        } else if (data.charCodeAt(0) === 127) { // BACKSPACE
            if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1);
                term.write('\b \b');
            }
        } else if (data >= " " && data <= "~") {
            inputBuffer += data;
            term.write(data);
        }
    });
};
