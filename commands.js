const fs = {
    '/': {
        'home': {
            'user': {
                'projects': {},
                'main.py': 'print("Hello world")',
                'app.js': 'console.log("Ready");'
            }
        }
    }
};

let currentPath = '/home/user';

function getDir(path) {
    let parts = path.split('/').filter(p => p);
    let current = fs['/'];
    for (let p of parts) { if (!current[p]) return null; current = current[p]; }
    return current;
}

const commands = {
    'help': () => {
        return "FILES:  ls, cd, pwd, mkdir, touch, cat, rm\r\n" +
               "EXEC:   python [file], node [file]\r\n" +
               "SYSTEM: clear, date, whoami, version\r\n";
    },
    
    'ls': () => {
        const dir = getDir(currentPath);
        return Object.keys(dir).map(name => 
            typeof dir[name] === 'object' ? `\x1b[1;34m${name}/\x1b[0m` : name
        ).join('  ') + '\r\n';
    },

    'cd': (args) => {
        let target = args[0];
        if (!target || target === '~') { currentPath = '/home/user'; return ""; }
        if (target === '..') {
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

    'clear': (args, term) => { term.clear(); return ""; },
    'pwd': () => currentPath + "\r\n",
    'date': () => new Date().toString() + "\r\n",
    'whoami': () => "user@vscode\r\n",
    'version': () => "v1.0.0-stable\r\n"
};