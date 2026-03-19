// invaders.js
async function showLeaderboard(term) {
    term.write("\r\n\x1b[36m--- TOP 5 RANKING ---\x1b[0m\r\n");
    if (window.CrazyGames && window.CrazyGames.SDK) {
        try {
            // Obtenemos los mejores resultados del leaderboard principal
            const results = await window.CrazyGames.SDK.game.getLeaderboard(5);
            if (results && results.length > 0) {
                results.forEach((entry, i) => {
                    term.write(`${i + 1}. ${entry.username.padEnd(15)} - ${entry.score} pts\r\n`);
                });
            } else {
                term.write("No scores yet. Be the first!\r\n");
            }
        } catch (e) {
            term.write("Could not load leaderboard.\r\n");
        }
    } else {
        term.write("Leaderboard only available on CrazyGames.\r\n");
    }
    term.write("\x1b[90mPress any key to start...\x1b[0m\r\n");
    
    return new Promise(resolve => {
        const l = term.onData(() => { l.dispose(); resolve(); });
    });
}

export async function startSpaceInvaders(term) {
    term.clear();
    // 1. Mostrar el Top 5 antes de jugar
    await showLeaderboard(term);
    
    term.clear();
    term.write("\x1b[?25l"); // Hide cursor
    
    let playerPos = 15;
    let bullets = [];
    let enemies = [];
    let score = 0;
    let direction = 1;
    let gameOver = false;

    // Initialize enemies
    for(let row = 0; row < 3; row++) {
        for(let col = 0; col < 8; col++) {
            enemies.push({ x: col * 4 + 5, y: row + 2, alive: true });
        }
    }

    return new Promise((resolve) => {
        const gameInterval = setInterval(async () => {
            if (gameOver) return;

            // Logica de movimiento
            bullets.forEach(b => b.y -= 0.8);
            bullets = bullets.filter(b => b.y > 0);

            let shiftDown = false;
            const activeEnemies = enemies.filter(e => e.alive);
            activeEnemies.forEach(e => {
                e.x += direction * 0.5;
                if (e.x > 35 || e.x < 2) shiftDown = true;
            });

            if (shiftDown) {
                direction *= -1;
                enemies.forEach(e => e.y += 0.5);
            }

            // Colisiones
            bullets.forEach((b, bi) => {
                enemies.forEach((e) => {
                    if (e.alive && Math.abs(b.x - e.x) < 2 && Math.abs(b.y - e.y) < 0.8) {
                        e.alive = false;
                        bullets.splice(bi, 1);
                        score += 10;
                    }
                });
            });

            // Renderizado (Canvas ASCII)
            let frame = "\x1b[H"; 
            frame += `\x1b[33m SCORE: ${score} \x1b[0m | A-D: Move | SPACE: Fire | ESC: Exit\r\n\n`;
            
            for (let y = 0; y < 15; y++) {
                let line = "";
                for (let x = 0; x < 40; x++) {
                    let char = " ";
                    if (y === 13 && x === playerPos) char = "\x1b[32m-^-\x1b[0m";
                    bullets.forEach(b => { if (Math.round(b.x) === x && Math.round(b.y) === y) char = "!"; });
                    enemies.forEach(e => { if (e.alive && Math.round(e.x) === x && Math.round(e.y) === y) char = "\x1b[31mOXO\x1b[0m"; });
                    line += char;
                }
                frame += line + "\r\n";
            }
            term.write(frame);

            if (activeEnemies.length === 0 && !gameOver) {
                gameOver = true;
                term.write("\r\n\x1b[32m  VICTORY! Reporting score... \x1b[0m");
                
                if (window.CrazyGames && window.CrazyGames.SDK) {
                    try {
                        await window.CrazyGames.SDK.game.reportScore(score);
                        term.write("\r\n\x1b[90mScore synced. Press ENTER to return.\x1b[0m");
                    } catch(e) { term.write("\r\nError syncing score."); }
                }
            }
        }, 80);

        const controller = term.onData(data => {
            if (data === 'a' && playerPos > 1) playerPos -= 1;
            if (data === 'd' && playerPos < 38) playerPos += 1;
            if (data === ' ') bullets.push({ x: playerPos + 1, y: 12 });
            if (data.charCodeAt(0) === 27 || (gameOver && data.charCodeAt(0) === 13)) {
                clearInterval(gameInterval);
                controller.dispose();
                term.write("\x1b[?25h"); 
                term.clear();
                resolve();
            }
        });
    });
}
