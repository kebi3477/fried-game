import { GRAVITY, MAX_LEFT, MAX_RIGHT, MAX_WIDTH, MAX_HEIGHT, WALL_WIDTH, LINE_HEIGHT } from '../../config/config.json.js';
const { Runner, Engine, Render, World, Bodies, MouseConstraint, Mouse } = Matter;

export const initWorld = () => {
    const runner = Runner.create();
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
    
    return { engine, runner, render, mouse, mouseConstraint };
}