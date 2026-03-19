export async function startSpaceInvaders(term) {
    term.clear();
    term.write("\x1b[?25l"); // Ocultar cursor

    const COLS = 80;
    const ROWS = 24;
    let playerX = 40;
    let bullets = [];
    let enemies = [];
    let score = 0;
    let direction = 1;
    let gameOver = false;
    let tick = 0;

    // Crear oleada de enemigos
    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 10; col++) {
            enemies.push({ x: col * 7 + 5, y: row + 2, alive: true });
        }
    }

    return new Promise((resolve) => {
        const gameLoop = setInterval(() => {
            if (gameOver) return;
            tick++;

            // 1. Mover Balas
            bullets.forEach(b => b.y--);
            bullets = bullets.filter(b => b.y > 0);

            // 2. Mover Enemigos (Cada 3 ticks para que no vuelen)
            let reachEdge = false;
            if (tick % 3 === 0) {
                enemies.filter(e => e.alive).forEach(e => {
                    e.x += direction;
                    if (e.x >= COLS - 5 || e.x <= 1) reachEdge = true;
                });

                if (reachEdge) {
                    direction *= -1;
                    enemies.filter(e => e.alive).forEach(e => {
                        e.y++;
                        // COLISIÓN: Si tocan al jugador o el suelo
                        if (e.y >= ROWS - 2) gameOver = "LOSER";
                    });
                }
            }

            // 3. Colisiones Bala -> Enemigo
            bullets.forEach((b, bIdx) => {
                enemies.filter(e => e.alive).forEach(e => {
                    if (Math.abs(b.x - (e.x + 1)) <= 2 && b.y === e.y) {
                        e.alive = false;
                        bullets.splice(bIdx, 1);
                        score += 10;
                    }
                });
            });

            // 4. Dibujar Pantalla (Buffer completo para evitar parpadeo)
            let out = "\x1b[H"; // Cursor a 0,0
            out += `\x1b[44;37m SCORE: ${score.toString().padStart(4, '0')} \x1b[0m  A/D: Move | SPACE: Shoot | ESC: Exit\r\n`;

            for (let y = 1; y < ROWS; y++) {
                let line = "";
                let lastX = 0;
                
                // Dibujar contenido de la línea
                if (y === ROWS - 2) { // Línea del Jugador
                    line = " ".repeat(playerX) + "\x1b[32m-^-\x1b[0m" + " ".repeat(COLS - playerX - 3);
                } else {
                    let rowChars = new Array(COLS).fill(" ");
                    
                    // Balas
                    bullets.forEach(b => { if (b.y === y) rowChars[b.x] = "\x1b[33m!\x1b[0m"; });
                    
                    // Enemigos
                    enemies.filter(e => e.alive && e.y === y).forEach(e => {
                        rowChars[Math.floor(e.x)] = "\x1b[31m<\x1b[0m";
                        rowChars[Math.floor(e.x) + 1] = "\x1b[31mO\x1b[0m";
                        rowChars[Math.floor(e.x) + 2] = "\x1b[31m>\x1b[0m";
                    });
                    line = rowChars.join("");
                }
                out += line + "\r\n";
            }
            term.write(out);

            // 5. Verificar Victoria
            if (enemies.filter(e => e.alive).length === 0) gameOver = "WINNER";

            if (gameOver) {
                clearInterval(gameLoop);
                term.write(`\r\n\x1b[1;${gameOver === "WINNER" ? "32" : "31"}m  *** ${gameOver}! Final Score: ${score} ***\x1b[0m\r\n  Press ENTER to exit`);
                if (window.CrazyGames && gameOver === "WINNER") window.CrazyGames.SDK.game.reportScore(score);
            }
        }, 50);

        const input = term.onData(data => {
            if (data === 'a' || data === 'A') if (playerX > 1) playerX -= 2;
            if (data === 'd' || data === 'D') if (playerX < COLS - 4) playerX += 2;
            if (data === ' ') if (bullets.length < 3) bullets.push({ x: playerX + 1, y: ROWS - 3 });
            
            if (data.charCodeAt(0) === 27 || (gameOver && data.charCodeAt(0) === 13)) {
                clearInterval(gameLoop);
                input.dispose();
                term.write("\x1b[?25h");
                term.clear();
                resolve();
            }
        });
    });
}
