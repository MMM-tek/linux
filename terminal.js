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
    window.currentFileContent = ""; 

    const prompt = () => term.write(`\x1b[32muser@vscode\x1b[0m:\x1b[34m~\x1b[0m$ `);
    prompt(); // Sin título, directo al prompt

    term.onData(async data => {
        if (isEditing) {
            if (data.charCodeAt(0) === 24) { // CTRL+X
                isEditing = false;
                term.clear();
                term.write("Edits kept in buffer. Type 'save' to write to disk.");
                prompt();
            } else if (data.charCodeAt(0) === 13) {
                window.currentFileContent += '\n'; term.write('\n');
            } else if (data.charCodeAt(0) === 127) {
                window.currentFileContent = window.currentFileContent.slice(0, -1);
                term.write('\b \b');
            } else {
                window.currentFileContent += data; term.write(data);
            }
            return;
        }

        if (data.charCodeAt(0) === 13) {
            term.write('\r\n');
            const parts = inputBuffer.trim().split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (commands[cmd]) {
                const res = await commands[cmd](args, term);
                if (res && res.mode === 'edit') {
                    isEditing = true;
                    term.clear();
                    term.write("\x1b[47;30m NANO EDITOR \x1b[0m (Write text... CTRL+X to exit)\r\n\r\n");
                    term.write(window.currentFileContent);
                } else if (res) { term.write(res); prompt(); }
                else { prompt(); }
            } else if (cmd !== "") {
                term.write(`bash: ${cmd}: command not found\r\n`);
                prompt();
            } else { prompt(); }
            inputBuffer = '';
        } else if (data.charCodeAt(0) === 127) {
            if (inputBuffer.length > 0) { inputBuffer = inputBuffer.slice(0, -1); term.write('\b \b'); }
        } else {
            inputBuffer += data; term.write(data);
        }
    });
};
