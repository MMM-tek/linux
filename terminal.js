window.onload = function() {
    const term = new window.Terminal({
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#ffffff',
            cursor: '#ffffff'
        },
        fontSize: 16,
        fontFamily: 'Consolas, "Courier New", monospace'
    });

    const container = document.getElementById('terminal');
    term.open(container);
    term.focus();

    let inputBuffer = '';
    const writePrompt = () => term.write(`\r\n\x1b[32muser@vscode\x1b[0m:\x1b[34m${currentPath}\x1b[0m$ `);

    term.write('Visual Studio Code Terminal Simulation\r\n');
    writePrompt();

    term.onData(data => {
        const code = data.charCodeAt(0);

        if (code === 13) { // ENTER
            term.write('\r\n');
            const parts = inputBuffer.trim().split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts.slice(1);

            if (commands[cmd]) {
                const output = commands[cmd](args, term);
                if (output !== undefined) term.write(output);
            } else if (cmd !== "") {
                term.write(`bash: ${cmd}: command not found\r\n`);
            }

            inputBuffer = '';
            writePrompt();
        } else if (code === 127) { // BACKSPACE
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
