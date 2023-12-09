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

export const get = (id) => {
    let svg = JSON.parse(localStorage.getItem(id));
    const bodySVG = Bodies.fromVertices(MAX_WIDTH / 2, START_CIRCLE_Y, [ svg ], {
        label: 'Circle',
        isSleeping: true, 
        restitution: RESTITUTION, 
        render: {
            fillStyle: '#fff', 
            strokeStyle: '#000',
            lineWidth: 2, 
        },
        config : circlesConfig[0],
        id : getId(),
        add : (engine) => World.add(engine.world, [bodySVG]),
        delete : (engine) => World.remove(engine.world, [bodySVG])
    });
    Body.scale(bodySVG, 0.2, 0.2);
    return bodySVG;
}