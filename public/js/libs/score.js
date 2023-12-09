const scoreDOM = document.querySelector('.score');

let score = 0;
let scorePoints = 10;

const sync = () => {
    scoreDOM.innerText = score;
}

export const addScore = () => {
    score += scorePoints;
    sync();
}

export const setScore = newScore => {
    score = newScore;
    sync();
}