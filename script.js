window.onload = function() {
    // 1. Terminal Configuration
    const term = new window.Terminal({
        cursorBlink: true,
        theme: {
            background: '#000000',
            foreground: '#ffffff' 
        }
    });

    const container = document.getElementById('terminal');
    term.open(container);

    // Initial prompt (Empty start)
    term.write('$ ');

    let inputBuffer = '';

    // 2. Data Input Listener
    term.onData(data => {
        const code = data.charCodeAt(0);

        if (code === 13) { // ENTER key
            term.write('\r\n');
            processCommand(inputBuffer);
            inputBuffer = '';
        } else if (code === 127) { // BACKSPACE key
            if (inputBuffer.length > 0) {
                inputBuffer = inputBuffer.slice(0, -1);
                term.write('\b \b');
            }
        } else if (data >= " " && data <= "~") { // Printable characters
            inputBuffer += data;
            term.write(data);
        }
    });

    // 3. Command Processor (English version)
    function processCommand(cmd) {
        const command = cmd.trim().toLowerCase();

        switch (command) {
            case 'help':
                term.write('Available commands: help, clear, info, exit\r\n');
                break;
            case 'clear':
                term.clear();
                break;
            case 'info':
                term.write('Minimalist xterm.js Web Terminal.\r\n');
                break;
            case 'exit':
                term.write('Session ended. Please close the tab.\r\n');
                break;
            case '':
                // Do nothing on empty enter
                break;
            default:
                term.write(`Command not found: ${command}\r\n`);
        }
        // Always show the prompt at the end
        term.write('$ ');
    }
};
