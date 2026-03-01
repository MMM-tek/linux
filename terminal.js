window.onload = function() {
    // Configuración para que se vea como una terminal normal
    const term = new window.Terminal({
        cursorBlink: true,
        rows: 30, // Más filas para que ocupe espacio
        theme: {
            background: '#000000', // Negro puro como antes
            foreground: '#ffffff', // Blanco para el texto
            cursor: '#ffffff',
            selection: 'rgba(255, 255, 255, 0.3)'
        },
        fontSize: 15,
        fontFamily: 'Consolas, "Liberation Mono", Menlo, Courier, monospace'
    });

    const container = document.getElementById('terminal');
    term.open(container);
    
    // Forzamos el foco para poder escribir nada más cargar
    term.focus();

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
            const args = parts.slice(1);

            if (commands[cmd]) {
                const result = commands[cmd](args, term);
                if (result !== undefined) term.write(result);
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
        } else if (data >= " " && data <= "~") { // Filtro para caracteres normales
            inputBuffer += data;
            term.write(data);
        }
    });
};
