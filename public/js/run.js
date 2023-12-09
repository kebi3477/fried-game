import circlesConfig from '../config/circles.json.js';
import { START_CIRCLE_Y, RESTITUTION, MAX_LEFT, MAX_RIGHT, LINE_HEIGHT, WALL_WIDTH } from '../config/config.json.js';
import * as circles from './libs/circles.js';
import { initWorld } from './libs/world.js';
import { addScore } from './libs/score.js';

const { Render, World, Bodies, Runner, Events, Body, Composite } = Matter;
const { engine, runner, render, mouse, mouseConstraint } = initWorld();

let draggableCircle = null;
let isMouseDown = false;
let isGameOver = false;

const createCircle = () => {
    if (isGameOver) {
        return;
    }

    const circle = circles.get('first');

    draggableCircle = circle;
    
    circle.add(engine);
}

const checkGameOver = () => {
    const circles = engine.world.bodies.filter(body => body.label === 'Circle');

    circles.forEach(circle => {
        if (!isGameOver && !circle.isSleeping && circle.position.y - LINE_HEIGHT + (WALL_WIDTH / 2) <= 0) {
            alert("Game Over");
            isGameOver = true;
            clearAllCircles();
        } 
    })
}

const clearAllCircles = () => {
    const circles = engine.world.bodies.filter(body => body.label === 'Circle');
    const delayBetweenRemovals = 100; 

    const removeCircleWithDelay = (circle, delay) => {
        setTimeout(() => {
            Composite.remove(engine.world, circle);
        }, delay);
    };

    circles.forEach((circle, index) => {
        const delay = index * delayBetweenRemovals;
        removeCircleWithDelay(circle, delay);
    });
}

Events.on(mouseConstraint, 'mousedown', (event) => {
    if (!isMouseDown) {
        isMouseDown = true;
        World.remove(engine.world, mouseConstraint);
    }
});

Events.on(mouseConstraint, 'mouseup', (event) => {
    if (draggableCircle) {
        draggableCircle.isSleeping = false;
        draggableCircle = null;
        isMouseDown = false;

        setTimeout(() => {
            checkGameOver();
            createCircle()
        }, 1000);

        World.add(engine.world, mouseConstraint);
    }
})

Events.on(engine, 'beforeUpdate', (event) => {
    if (draggableCircle && isMouseDown) {
        const radius = draggableCircle.circleRadius;
        const x = mouse.position.x + radius > MAX_RIGHT ? MAX_RIGHT - radius : (mouse.position.x <= MAX_LEFT + radius ? MAX_LEFT + radius : mouse.position.x);
        Body.setPosition(draggableCircle, { x: x, y: START_CIRCLE_Y });
    }
});

Events.on(engine, 'collisionStart', (event) => {
    if (isGameOver) {
        return;
    }

    const pairs = event.pairs;
    pairs.forEach(pair => {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        if (bodyA.config === undefined || bodyB.config === undefined) {
            return;
        }
        
        if (bodyA.isMerge || bodyB.isMerge) {
            return;
        }
        
        if (bodyA.config.index === bodyB.config.index) {
            bodyA.isMerge = true;
            bodyB.isMerge = true;

            const config = circlesConfig[bodyA.config.index];
            const newRadius = config.size;

            const newX = (bodyA.position.x + bodyB.position.x) / 2;
            const newY = (bodyA.position.y + bodyB.position.y) / 2;

            const mergedCircle = Bodies.circle(newX, newY, newRadius, {
                label: 'Circle',
                restitution: RESTITUTION,
                render: { sprite: { texture: `images/${config.image}`, xScale: config.scale, yScale: config.scale },  }
            });

            mergedCircle.config = config;

            if (bodyA.delete) bodyA.delete(engine);
            if (bodyB.delete) bodyB.delete(engine);

            World.remove(engine.world, [bodyA, bodyB]);
            World.add(engine.world, [mergedCircle]);
            
            addScore();
            circles.addEffect(engine, newX, newY, newRadius, bodyA.angle, config.scale);
        }
    });
});

circles.initSVG();
Render.run(render);
Runner.run(runner, engine);

createCircle();