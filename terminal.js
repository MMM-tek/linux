import { startSpaceInvaders } from './invaders.js';

const BANNER = `
\x1b[36m    _/_/_/_/_/  _/_/_/_/  _/_/_/    _/      _/  _/_/_/  _/    _/    _/_/    _/        
       _/      _/        _/    _/  _/_/  _/_/    _/    _/_/  _/  _/    _/  _/        
      _/      _/_/_/    _/_/_/    _/  _/  _/    _/    _/  _/_/  _/_/_/_/  _/        
     _/      _/        _/    _/  _/      _/    _/    _/    _/  _/    _/  _/        
    _/      _/_/_/_/  _/    _/  _/      _/  _/_/_/  _/    _/  _/    _/  _/_/_/_/  \x1b[0m
\r\n`;

async function ask(term, question) {
    return new Promise(resolve => {
        term.write(`${question} \x1b[33m>\x1b[0m `);
        let input = "";
        const l = term.onData(d => {
            const char = d.charCodeAt(0);
            if (char === 13) { l.dispose(); term.write('\r\n'); resolve(input.trim()); }
            else if (char === 127) { if(input.length>0){input=input.slice(0,-1); term.write('\b \b');} }
            else { input += d; term.write(d); }
        });
    });
}

async function selectMenu(term, title, options) {
    term.write(`\r\n\x1b[1;34m[ ${title} ]\x1b[0m\r\n`);
    options.forEach((opt, i) => term.write(`${i + 1}. ${opt}\r\n`));
    let choice = "";
    const valid = options.map((_, i) => (i + 1).toString());
    while (!valid.includes(choice)) {
        choice = await ask(term, "Select an option");
    }
    return parseInt(choice);
}

window.onload = async function() {
    const params = new URLSearchParams(window.location.search);
    let userName = 'user';

    if (params.get('cg') === 'true' && window.CrazyGames) {
        try {
            await window.CrazyGames.SDK.init();
            const isAvail = await window.CrazyGames.SDK.user.isUserAccountAvailable();
            if (isAvail) {
                const user = await window.CrazyGames.SDK.user.getUser();
                if (user) userName = user.username;
            }
        } catch (e) { userName = 'user'; }
    }

    const term = new window.Terminal({ 
        cursorBlink: true, 
        convertEol: true, 
        fontSize: 16,
        theme: { background: '#000000' }
    });
    
    term.open(document.getElementById('terminal'));
    term.focus();
    term.write(BANNER);

    const choice = await selectMenu(term, "START MENU", ["Bash Terminal", "Play Space Invaders"]);
    
    if (choice === 2) {
        await startSpaceInvaders(term);
        term.write(BANNER);
    }

    const prompt = () => term.write(`\x1b[32m${userName}@vscode\x1b[0m:\x1b[34m~\x1b[0m$ `);
    prompt();

    let inputBuffer = "";
    term.onData(async (data) => {
        if (data.charCodeAt(0) === 13) {
            term.write('\r\n');
            const cmd = inputBuffer.trim().toLowerCase();
            
            if (cmd === 'invaders') { await startSpaceInvaders(term); term.write(BANNER); }
            else if (cmd === 'clear') { term.clear(); term.write(BANNER); }
            else if (cmd === 'help') term.write("Commands: invaders, clear, help\r\n");
            else if (cmd !== "") term.write(`bash: ${cmd}: command not found\r\n`);
            
            inputBuffer = "";
            prompt();
        } else if (data.charCodeAt(0) === 127) {
            if (inputBuffer.length > 0) { inputBuffer = inputBuffer.slice(0, -1); term.write('\b \b'); }
        } else if (data >= " " && data <= "~") {
            inputBuffer += data;
            term.write(data);
        }
    });
};
