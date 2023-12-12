import { RESTITUTION, MAX_WIDTH, START_CIRCLE_Y, getId } from '../../config/config.json.js';
import circlesConfig from '../../config/circles.json.js';
const { Svg, Vertices, Bodies, Body, World } = Matter;

export const initSVG = () => {
    const paths = document.querySelectorAll('path');
    paths.forEach((path) => {
        if (localStorage.getItem(path.id)) {
            return;
        }
        
        let vertices = Svg.pathToVertices(path);
        vertices = Vertices.scale(vertices, 1, 1);
        localStorage.setItem(path.id, JSON.stringify(vertices));
    })
}

export const get = (id, x=MAX_WIDTH / 2, y=START_CIRCLE_Y) => {
    const config = circlesConfig.find(circle => circle.id === id);
    const circle = Bodies.circle(x, y, config.size, {
        label: 'Circle',
        isSleeping: id === 'first', 
        restitution: RESTITUTION,
        render: { sprite: { texture: `images/${config.image}`, xScale: config.scale, yScale: config.scale },  },
        config : config,
        id : getId(),
        add : (engine) => World.add(engine.world, [circle]),
        delete : (engine) => World.remove(engine.world, [circle])
    });
    return circle;
}

export const addEffect = (engine, x, y, radius, angle, scale) => {
    const mergeEffect = Bodies.circle(x, y, radius, {
        label: 'Effect',
        isStatic: true,
        isSensor: true,
        angle: angle,
        render: { sprite: { texture: `images/remove_effect.png`, xScale: scale, yScale: scale, opacity: 1 }}
    })

    World.add(engine.world, [mergeEffect]);     
    requestAnimationFrame(fadeEffect(engine, mergeEffect));     
}

const fadeEffect = (engine, body) => {
    const animateFade = () => {
        if (body.render.opacity > 0) {
            const newOpacity = body.render.opacity - 0.05; 
            body.render.opacity = newOpacity < 0 ? 0 : newOpacity;
            requestAnimationFrame(animateFade);
        } else {
            World.remove(engine.world, body);
        }
    };

    return animateFade;
};