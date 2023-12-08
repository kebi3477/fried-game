import circlesConfig from '../config/circles.json.js';
const { Engine, Render, World, Bodies, Runner, Events, MouseConstraint, Mouse, Body, Composite } = Matter;

const START_CIRCLE_Y = 40;
const GRAVITY = 2;
const RESTITUTION = 0.2
const MAX_LEFT = 0;
const MAX_RIGHT = 400;
const MAX_WIDTH = 400;
const MAX_HEIGHT = 800;
const WALL_WIDTH = 5;
const LINE_HEIGHT = 100;

const engine = Engine.create({
    gravity: {
        x: 0,   
        y: GRAVITY
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
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: {
        stiffness: 0.2,
        render: {
            visible: false
        }
    } 
})

const scoreDOM = document.querySelector('.score');

let draggableCircle = null;
let isMouseDown = false;
let isGameOver = false;
let score = 0;

const initWorld = () => {
    const ground = Bodies.rectangle(MAX_WIDTH / 2, MAX_HEIGHT, MAX_WIDTH, WALL_WIDTH, { 
        isStatic: true 
    });
    const background = Bodies.rectangle(MAX_WIDTH / 2, MAX_HEIGHT - 190, MAX_WIDTH, MAX_HEIGHT, { 
        isStatic: true, 
        isSensor: true, 
        render: { 
            sprite: { 
                texture: 'images/background.png', 
                xScale: 0.19, 
                yScale: 0.1
            },
            zIndex: -1,
        }
    })
    const pan = Bodies.rectangle(MAX_WIDTH / 2, MAX_HEIGHT, MAX_WIDTH, 50, { 
        isStatic: true,
        render: {
            fillStyle: 'transparent'
        }
    });
    const line = Bodies.rectangle(MAX_WIDTH / 2, LINE_HEIGHT, MAX_WIDTH, WALL_WIDTH, { 
        label: 'line', 
        isStatic: true, 
        isSensor: true 
    });
    const leftWall = Bodies.rectangle(MAX_LEFT, MAX_HEIGHT / 2, WALL_WIDTH, MAX_HEIGHT, { 
        isStatic: true,
        render: {
            fillStyle: 'transparent'
        }
    });
    const rightWall = Bodies.rectangle(MAX_RIGHT, MAX_HEIGHT / 2, WALL_WIDTH, MAX_HEIGHT, { 
        isStatic: true,
        render: {
            fillStyle: 'transparent'
        }
    });

    World.add(engine.world, [ground, line, leftWall, rightWall, pan, background, mouseConstraint]);
}

const createCircle = () => {
    if (isGameOver) {
        return;
    }

    const circle = Bodies.circle(MAX_WIDTH / 2, START_CIRCLE_Y, circlesConfig[0].size, { 
        label: 'Circle',
        isSleeping: true, 
        restitution: RESTITUTION, 
        render: {
            sprite: { texture: `images/${circlesConfig[0].image}`, xScale: 0.04, yScale: 0.04 }, 
        } 
    });

    draggableCircle = circle;
    circle.config = circlesConfig[0];
    World.add(engine.world, [circle]);
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

const fadeEffect = (body) => {
    const animateFade = () => {
        if (body.render.opacity > 0) {
            const newOpacity = body.render.opacity - 0.05; 
            body.render.opacity = newOpacity < 0 ? 0 : newOpacity;
            console.log(body.render.opacity);
            requestAnimationFrame(animateFade);
        } else {
            World.remove(engine.world, body);
        }
    };

    return animateFade;
};

const setScore = newScore => {
    score = newScore;
    scoreDOM.innerText = score
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

            const effectA = Bodies.circle(newX, newY, newRadius, {
                label: 'Effect',
                isStatic: true,
                isSensor: true,
                angle: bodyA.angle,
                render: { sprite: { texture: `images/remove_effect.png`, xScale: config.scale, yScale: config.scale, opacity: 1 }}
            })

            setScore(score + 10);
            mergedCircle.config = config;
            World.remove(engine.world, [bodyA, bodyB]);
            World.add(engine.world, [mergedCircle, effectA]);   
            requestAnimationFrame(fadeEffect(effectA));         
        }
    });
});

initWorld();
Render.run(render);
Runner.run(runner, engine);

createCircle();