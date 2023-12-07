import circle from '../config/circles.json.js';
const { Engine, Render, World, Bodies, Runner, Events } = Matter;

const MAX_LEFT = 0;
const MAX_RIGHT = 400;
const MAX_WIDTH = 400;
const MAX_HEIGHT = 800;
const WALL_WIDTH = 10;

console.log(circle);

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
    const y = event.clientY;
    const circle = Bodies.circle(x, 20, 30, { restitution: 1, render: { fillStyle: getRandomColor() } });
    circles.push(circle);
    World.add(engine.world, [circle]);
});

Events.on(engine, 'collisionStart', (event) => {
    const pairs = event.pairs;
  
    for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];

        if (pair.bodyA.circleRadius === pair.bodyB.circleRadius) {
            console.log(pair.bodyA.circleRadius);
            const newRadius = (pair.bodyA.circleRadius) * 1.5;

            const newX = (pair.bodyA.position.x + pair.bodyB.position.x) / 2;
            const newY = (pair.bodyA.position.y + pair.bodyB.position.y) / 2;

            const mergedCircle = Bodies.circle(newX, newY, newRadius, {
                restitution: 1,
                render: { fillStyle: getRandomColor() }
            });

            World.remove(engine.world, [pair.bodyA, pair.bodyB]);

            World.add(engine.world, [mergedCircle]);
        }
    }
});

World.add(engine.world, [ground, leftWall, rightWall    ]);

Render.run(render);
Runner.run(runner, engine);