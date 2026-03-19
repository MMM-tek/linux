// invaders.js
export async function startSpaceInvaders(term) {
    term.clear();
    term.write("\x1b[?25l"); // Ocultar cursor
    
    let playerPos = 40; 
    let bullets = [];
    let enemies = [];
    let score = 0;
    let direction = 1;
    let gameOver = false;
    const GROUND_LINE = 20; // Línea de derrota

    // Crear 48 enemigos (4 filas x 12 columnas)
    for(let row = 0; row < 4; row++) {
        for(let col = 0; col < 12; col++) {
            enemies.push({ x: col * 6 + 5, y: row + 3, alive: true });
        }
    }

    return new Promise((resolve) => {
        const gameInterval = setInterval(async () => {
            if (gameOver) return;

            // Movimiento de proyectiles
            bullets.forEach(b => b.y -= 1);
            bullets = bullets.filter(b => b.y > 0);

            let shiftDown = false;
            const activeEnemies = enemies.filter(e => e.alive);
            
            activeEnemies.forEach(e => {
                e.x += direction * 0.8;
                if (e.x > 74 || e.x < 2) shiftDown = true;
                
                // CONDICIÓN DE DERROTA
                if (e.y >= GROUND_LINE - 1) {
                    gameOver = true;
                }
            });

            if (shiftDown) {
                direction *= -1;
                enemies.forEach(e => e.y += 1);
            }

            // Detección de impactos
            bullets.forEach((b, bi) => {
                enemies.forEach((e) => {
                    if (e.alive && Math.abs(b.x - e.x) < 3 && Math.abs(b.y - e.y) < 0.8) {
                        e.alive = false;
                        bullets.splice(bi, 1);
                        score += 10;
                    }
                });
            });

            // --- RENDERIZADO ---
            let frame = "\x1b[H"; // Volver al inicio (0,0)
            frame += `\x1b[33m SCORE: ${score.toString().padStart(4, '0')} \x1b[0m | A-D: Move | SPACE: Fire | ESC: Exit\r\n`;
            frame += "\x1b[90m" + "─".repeat(80) + "\x1b[0m\r\n";
            
            // Dibujar 22 líneas de juego
            for (let y = 1; y <= 22; y++) {
                let line = "";
                for (let x = 0; x < 80; x++) {
                    let char = " ";
                    // Jugador en la penúltima línea
                    if (y === 21 && x === playerPos) char = "\x1b[32m-^-\x1b[0m";
                    // Balas
                    bullets.forEach(b => { if (Math.round(b.x) === x && Math.round(b.y) === y) char = "!"; });
                    // Enemigos
                    enemies.forEach(e => { if (e.alive && Math.round(e.x) === x && Math.round(e.y) === y) char = "\x1b[31m<OX>\x1b[0m"; });
                    line += char;
                }
                frame += line + "\r\n";
            }
            term.write(frame);

            if (gameOver) {
                term.write("\r\n\x1b[31;1m  GAME OVER! Aliens reached the ground. Press ENTER \x1b[0m");
                clearInterval(gameInterval);
            }

            if (activeEnemies.length === 0 && !gameOver) {
                gameOver = true;
                term.write("\r\n\x1b[32;1m  VICTORY! Reporting score... Press ENTER \x1b[0m");
                if (window.CrazyGames) await window.CrazyGames.SDK.game.reportScore(score);
                clearInterval(gameInterval);
            }
        }, 60);

        const controller = term.onData(data => {
            const key = data.toLowerCase();
            if (key === 'a' && playerPos > 2) playerPos -= 2;
            if (key === 'd' && playerPos < 76) playerPos += 2;
            if (key === ' ') bullets.push({ x: playerPos + 1, y: 20 });
            
            // Salida manual o tras ganar/perder
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
