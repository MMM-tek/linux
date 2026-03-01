window.onload = function() {
    // Configuración visual de la terminal
    const term = new window.Terminal({
        cursorBlink: true,
        theme: { background: '#1e1e1e', foreground: '#d4d4d4' },
        fontSize: 14
    });

    term.open(document.getElementById('terminal'));
    
    let inputBuffer = '';
    const prompt = () => term.write(`\r\n\x1b[32muser@vscode\x1b[0m:\x1b[34m${currentPath}\x1b[0m$ `);

    term.write('VS Code Web Terminal Loaded.\r\n');
    prompt();

    term.onData(data => {
        const code = data.charCodeAt(0);

        if (code === 13) { // ENTER
            term.write('\r\n');
            const parts = inputBuffer.trim().split(/\s+/);
            const cmd = parts[0].toLowerCase();
            const args = parts[1];

            if (commands[cmd]) {
                // Ejecutar comando (pasamos term por si el comando necesita limpiar pantalla)
                const result = commands[cmd](args, term);
                term.write(result);
            } else if (cmd !== "") {
                term.write(`bash: ${cmd}: command not found\r\n`);
            }

            inputBuffer = '';
            prompt();
        } else if (code === 127) { // BACKSPACE
            if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1);
                term.write('\b \b');
            }
        } else {
            inputBuffer += data;
            term.write(data);
        }
    });
};
