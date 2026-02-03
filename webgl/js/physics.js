/**
 * SOL VERMELHO WebGL - Sistema de Física
 * Versão simplificada sem Box2D (colisões básicas)
 * TODO: Integrar Box2D para física realista de veículos
 */

class Physics {
    constructor() {
        this.bodies = [];
        this.staticBodies = [];  // Prédios, paredes
    }

    /**
     * Adiciona corpo dinâmico (player, NPCs, carros)
     */
    addDynamic(entity) {
        this.bodies.push(entity);
    }

    /**
     * Adiciona corpo estático (prédios)
     */
    addStatic(body) {
        this.staticBodies.push(body);
    }

    /**
     * Remove corpo
     */
    remove(entity) {
        const idx = this.bodies.indexOf(entity);
        if (idx > -1) this.bodies.splice(idx, 1);
    }

    /**
     * Atualiza física (chamado a cada frame)
     */
    update(delta) {
        for (const body of this.bodies) {
            if (body.velocity) {
                // Aplica velocidade
                body.position.x += body.velocity.x * delta;
                body.position.y += body.velocity.y * delta;

                // Aplica fricção
                body.velocity.x *= 0.95;
                body.velocity.y *= 0.95;

                // Verifica colisões com estáticos
                this.checkCollisions(body);
            }
        }
    }

    /**
     * Verifica colisões de um corpo com objetos estáticos
     */
    checkCollisions(body) {
        for (const wall of this.staticBodies) {
            if (this.intersects(body, wall)) {
                // Resolve colisão empurrando para fora
                this.resolveCollision(body, wall);
            }
        }

        // Mantém dentro dos limites do mundo
        this.clampToWorld(body);
    }

    /**
     * Verifica se dois retângulos se intersectam
     */
    intersects(a, b) {
        const aLeft = a.position.x - (a.width || a.radius || 10);
        const aRight = a.position.x + (a.width || a.radius || 10);
        const aTop = a.position.y - (a.height || a.radius || 10);
        const aBottom = a.position.y + (a.height || a.radius || 10);

        const bLeft = b.x;
        const bRight = b.x + b.w;
        const bTop = b.y;
        const bBottom = b.y + b.h;

        return !(aRight < bLeft || aLeft > bRight || aBottom < bTop || aTop > bBottom);
    }

    /**
     * Resolve colisão empurrando corpo para fora
     */
    resolveCollision(body, wall) {
        const bodyLeft = body.position.x - (body.radius || 10);
        const bodyRight = body.position.x + (body.radius || 10);
        const bodyTop = body.position.y - (body.radius || 10);
        const bodyBottom = body.position.y + (body.radius || 10);

        const wallCenterX = wall.x + wall.w / 2;
        const wallCenterY = wall.y + wall.h / 2;

        // Calcula overlap em cada eixo
        const overlapX = (body.position.x < wallCenterX)
            ? wall.x - bodyRight
            : (wall.x + wall.w) - bodyLeft;

        const overlapY = (body.position.y < wallCenterY)
            ? wall.y - bodyBottom
            : (wall.y + wall.h) - bodyTop;

        // Empurra no eixo com menor overlap
        if (Math.abs(overlapX) < Math.abs(overlapY)) {
            body.position.x += overlapX;
            body.velocity.x = 0;
        } else {
            body.position.y += overlapY;
            body.velocity.y = 0;
        }
    }

    /**
     * Mantém corpo dentro dos limites do mundo
     */
    clampToWorld(body) {
        const margin = body.radius || 10;

        if (body.position.x < margin) {
            body.position.x = margin;
            body.velocity.x = 0;
        }
        if (body.position.x > CONFIG.WORLD_W - margin) {
            body.position.x = CONFIG.WORLD_W - margin;
            body.velocity.x = 0;
        }
        if (body.position.y < margin) {
            body.position.y = margin;
            body.velocity.y = 0;
        }
        if (body.position.y > CONFIG.WORLD_H - margin) {
            body.position.y = CONFIG.WORLD_H - margin;
            body.velocity.y = 0;
        }
    }

    /**
     * Raycast simples para tiros
     */
    raycast(origin, direction, maxDistance) {
        const hits = [];
        const step = 5;
        const steps = Math.floor(maxDistance / step);

        for (let i = 1; i <= steps; i++) {
            const x = origin.x + direction.x * step * i;
            const y = origin.y + direction.y * step * i;

            // Verifica hit em corpos dinâmicos
            for (const body of this.bodies) {
                if (body === origin.owner) continue;

                const dist = Math.hypot(body.position.x - x, body.position.y - y);
                if (dist < (body.radius || 10)) {
                    hits.push({
                        body,
                        point: { x, y },
                        distance: step * i
                    });
                }
            }

            // Verifica hit em paredes
            for (const wall of this.staticBodies) {
                if (x >= wall.x && x <= wall.x + wall.w &&
                    y >= wall.y && y <= wall.y + wall.h) {
                    return { wall, point: { x, y }, distance: step * i };
                }
            }
        }

        return hits.length > 0 ? hits[0] : null;
    }
}
