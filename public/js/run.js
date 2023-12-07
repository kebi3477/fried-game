import circlesConfig from '../config/circles.json.js';
const { Engine, Render, World, Bodies, Runner, Events } = Matter;

const RESTITUTION = 0.2
const MAX_LEFT = 0;
const MAX_RIGHT = 400;
const MAX_WIDTH = 400;
const MAX_HEIGHT = 800;
const WALL_WIDTH = 10;

const engine = Engine.create({
    gravity: {
        x: 0,   
        y: 2
    }
});
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: MAX_WIDTH,
        height: MAX_HEIGHT,
        wireframes: false, 
        background: 'white' 
    }
});

const runner = Runner.create();

const ground = Bodies.rectangle(MAX_WIDTH / 2, MAX_HEIGHT, MAX_WIDTH, WALL_WIDTH, { isStatic: true });
const leftWall = Bodies.rectangle(MAX_LEFT, MAX_HEIGHT / 2, WALL_WIDTH, MAX_HEIGHT, { isStatic: true });
const rightWall = Bodies.rectangle(MAX_RIGHT, MAX_HEIGHT / 2, WALL_WIDTH, MAX_HEIGHT, { isStatic: true });

const circles = [];

document.addEventListener('click', (event) => {
    const x = event.clientX;
    const circle = Bodies.circle(x, 20, circlesConfig[0].size, { restitution: RESTITUTION, render: { fillStyle: circlesConfig[0].color } });
    circle.config = circlesConfig[0];
    circles.push(circle);
    World.add(engine.world, [circle]);
});

Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
  
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        
        if (pair.bodyA.circleRadius === pair.bodyB.circleRadius) {
            const config = circlesConfig[pair.bodyA.config.index];
            const newRadius = config.size;

            const newX = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
            const newY = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;

            const mergedCircle = Bodies.circle(newX, newY, newRadius, {
                restitution: RESTITUTION,
                render: { fillStyle: config.color }
            });

            mergedCircle.config = config;
            World.remove(engine.world, [pair.bodyA, pair.bodyB]);
            World.add(engine.world, [mergedCircle]);
        }
    }
});

World.add(engine.world, [ground, leftWall, rightWall ]);

Render.run(render);
Runner.run(runner, engine);