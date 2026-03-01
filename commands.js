// Sistema de archivos virtual
const fs = {
    '/': {
        'home': {
            'user': {
                'projects': {
                    'web-term': {
                        'app.js': 'console.log("Terminal logic loaded.");'
                    }
                },
                'main.py': 'print("Hello from Python simulation")',
                'notes.txt': 'Keep coding and learning.'
            }
        },
        'bin': { 'python': '[bin]', 'node': '[bin]', 'bash': '[bin]' }
    }
};

let currentPath = '/home/user';

// Función para navegar por el sistema de archivos
function getDir(path) {
    let parts = path.split('/').filter(p => p);
    let current = fs['/'];
    for (let p of parts) { 
        if (!current[p]) return null; 
        current = current[p]; 
    }
    return current;
}

// Diccionario de comandos funcionales
const commands = {
    'help': () => "FILES: ls, cd, pwd, mkdir, touch, cat, rm\nEXEC: python [file], node [file]\nSYSTEM: clear, date, whoami, version",
    
    'ls': () => {
        const dir = getDir(currentPath);
        const items = Object.keys(dir).map(name => 
            typeof dir[name] === 'object' ? `\x1b[1;34m${name}/\x1b[0m` : name
        );
        return items.length ? items.join('  ') + '\r\n' : "Empty directory\r\n";
    },

    'cd': (args) => {
        let target = args[0];
        if (!target || target === '~') { currentPath = '/home/user'; return ""; }
        if (target === '..') {
            if (currentPath === '/') return "";
            let parts = currentPath.split('/').filter(p => p);
            parts.pop();
            currentPath = '/' + parts.join('/');
            return "";
        }
        const dir = getDir(currentPath);
        if (dir[target] && typeof dir[target] === 'object') {
            currentPath = currentPath === '/' ? `/${target}` : `${currentPath}/${target}`;
            return "";
        }
        return `cd: no such directory: ${target}\r\n`;
    },

    'pwd': () => currentPath + "\r\n",

    'mkdir': (args) => {
        if (!args[0]) return "mkdir: missing operand\r\n";
        getDir(currentPath)[args[0]] = {};
        return "";
    },

    'touch': (args) => {
        if (!args[0]) return "touch: missing file operand\r\n";
        getDir(currentPath)[args[0]] = "";
        return "";
    },

    'cat': (args) => {
        const file = getDir(currentPath)[args[0]];
        if (typeof file === 'string') return file + '\r\n';
        return `cat: ${args[0]}: No such file\r\n`;
    },

    'python': (args) => {
        const file = getDir(currentPath)[args[0]];
        if (!file) return `python: can't open file '${args[0]}': No such file\r\n`;
        return `\x1b[33m[Python 3 Execution]:\x1b[0m\r\n${file}\r\n`;
    },

    'node': (args) => {
        const file = getDir(currentPath)[args[0]];
        if (!file) return `node: no such file: ${args[0]}\r\n`;
        return `\x1b[32m[Node.js Execution]:\x1b[0m\r\n${file}\r\n`;
    },

    'rm': (args) => {
        const dir = getDir(currentPath);
        if (dir[args[0]]) { delete dir[args[0]]; return ""; }
        return `rm: cannot remove '${args[0]}': No such file\r\n`;
    },

    'clear': (args, term) => { term.clear(); return ""; },
    'whoami': () => "vscode_user\r\n",
    'date': () => new Date().toString() + "\r\n",
    'version': () => "VS Code Web-Term v2.1.0\r\n"
};
