// Sistema de archivos virtual (Carpetas y archivos)
const fs = {
    '/': {
        'home': {
            'user': {
                'projects': {},
                'main.py': 'print("Hello from VS Code")',
                'app.js': 'console.log("Terminal Ready");'
            }
        },
        'bin': { 'python': '[bin]', 'node': '[bin]' }
    }
};

let currentPath = '/home/user';

// Función para navegar por el sistema de archivos
function getDir(path) {
    let parts = path.split('/').filter(p => p);
    let current = fs['/'];
    for (let p of parts) { if (!current[p]) return null; current = current[p]; }
    return current;
}

// Diccionario de comandos
const commands = {
    'help': () => "FILES: ls, cd, pwd, mkdir, touch, cat\nEXEC: python [file], node [file]\nSYSTEM: clear, date, whoami",
    
    'ls': () => {
        const dir = getDir(currentPath);
        return Object.keys(dir).map(name => 
            typeof dir[name] === 'object' ? `\x1b[1;34m${name}/\x1b[0m` : name
        ).join('  ') + '\r\n';
    },

    'cd': (args) => {
        if (!args || args === '~') { currentPath = '/home/user'; return ""; }
        if (args === '..') {
            let parts = currentPath.split('/').filter(p => p);
            parts.pop();
            currentPath = '/' + parts.join('/');
            return "";
        }
        const dir = getDir(currentPath);
        if (dir[args] && typeof dir[args] === 'object') {
            currentPath = currentPath === '/' ? `/${args}` : `${currentPath}/${args}`;
            return "";
        }
        return `cd: no such directory: ${args}\r\n`;
    },

    'cat': (args) => {
        const file = getDir(currentPath)[args];
        return (typeof file === 'string') ? file + '\r\n' : `cat: ${args}: No such file\r\n`;
    },

    'python': (args) => {
        const file = getDir(currentPath)[args];
        if (!file) return `python: can't open file '${args}': No such file\r\n`;
        return `\x1b[33m[Python Output]:\x1b[0m\r\n${file}\r\n`;
    },

    'node': (args) => {
        const file = getDir(currentPath)[args];
        if (!file) return `node: no such file: ${args}\r\n`;
        return `\x1b[32m[Node.js Output]:\x1b[0m\r\n${file}\r\n`;
    },

    'pwd': () => currentPath + "\r\n",
    'whoami': () => "vscode_user\r\n",
    'date': () => new Date().toString() + "\r\n",
    'clear': (term) => { term.clear(); return ""; }
};
