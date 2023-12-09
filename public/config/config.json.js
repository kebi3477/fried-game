export const START_CIRCLE_Y = 40;
export const GRAVITY = 2;
export const RESTITUTION = 0.2
export const MAX_LEFT = 0;
export const MAX_RIGHT = 400;
export const MAX_WIDTH = 400;
export const MAX_HEIGHT = 800;
export const WALL_WIDTH = 5;
export const LINE_HEIGHT = 100;

let id = 10;
export const getId = () => {
    return id++;
}