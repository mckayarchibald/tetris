const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

context.canvas.height = 729;
context.canvas.width = 630;
context.scale(30, 27);

let lineCount = 0;
let highScore = 0;
let pausePlay = true;
let showPopUp = true;

function clearLine() {
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }

        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;
        rowCount *= 2;
        player.lines++;
        lineCount++;
        
        if(lineCount === 5) {
            lineCount = 0;
            if(dropInterval > 50) {
                dropInterval = dropInterval - 10;
            }
        }
    }
}

function collide(arena, player) {
    const matrix = player.matrix;
    const offset = player.position;
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < matrix[y].length; ++x) {
            if (matrix[y][x] !== 0 &&
               (arena[y + offset.y] &&
                arena[y + offset.y][x + offset.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function createMatrix(width, height) {
    const matrix = [];
    while (height--) {
        matrix.push(new Array(width).fill(0));
    }
    return matrix;
}

function createTetromino(type)
{
    switch(type) {
        case 'I':
            return [
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
                [0, 1, 0, 0],
            ];
        case 'L':
            return [
                [0, 2, 0],
                [0, 2, 0],
                [0, 2, 2],
            ];
        case 'J':
            return [
                [0, 3, 0],
                [0, 3, 0],
                [3, 3, 0],
            ];
        case 'O':
            return [
                [4, 4],
                [4, 4],
            ];
        case 'Z':
            return [
                [5, 5, 0],
                [0, 5, 5],
                [0, 0, 0],
            ];
        case 'S':
            return [
                [0, 6, 6],
                [6, 6, 0],
                [0, 0, 0],
            ];
        case 'T':
            return [
                [0, 7, 0],
                [7, 7, 7],
                [0, 0, 0],
            ];
    }
}

function draw() {
    context.fillStyle = '#F0F0F0';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.position);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.position.y][x + player.position.x] = value;
            }
        });
    });
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }


    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }


    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}

function playerDrop() {
    player.position.y++;
    if (collide(arena, player)) {
        player.position.y--;
        merge(arena, player);
        playerReset();
        clearLine();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove(offset) {
    player.position.x += offset;
    if (collide(arena, player)) {
        player.position.x -= offset;
    }
}

function playerReset() {
    const tetrominoes = 'TJLOSZI';
    player.matrix = createTetromino(tetrominoes[tetrominoes.length * Math.random() | 0]);
    player.position.y = 0;
    player.position.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        let playAgain = true;
        if(showPopUp) {
            playAgain = window.confirm(`The next piece didn't fit in the play area. You scored ${player.score} points and cleared ${player.lines} lines. Play again?`);
        }
        showPopUp = true;
        if(playAgain) {
            arena.forEach(row => row.fill(0));
            player.score = 0;
            player.lines = 0;
            updateScore();
        } else {
            pausePlay = true;
            const playButton = document.getElementById('play-button');
            const pauseButton = document.getElementById('pause-button');
            const restartButton = document.getElementById('restart-button');
            playButton.style.visibility = 'hidden';
            pauseButton.style.visibility = 'hidden';
            restartButton.style.visibility = 'visible';
        }
    }
}

function rotatePiece(dir) {
    const pos = player.position.x;
    let offset = 1;
    rotate(player.matrix, dir);
    while (collide(arena, player)) {
        player.position.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            rotate(player.matrix, -dir);
            player.position.x = pos;
            return;
        }
    }
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    if(!pausePlay) {
        const deltaTime = time - lastTime;
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        lastTime = time;
        if(!pausePlay){
            draw();
            requestAnimationFrame(update);
        }
    }
}

function updateScore() {
    document.getElementById('score').innerText = player.score;
    document.getElementById('lines').innerText = player.lines;
    if(player.score > highScore) {
        highScore = player.score;
    }
    document.getElementById('high-score').innerText = highScore;
}

function clickPause() {
    pausePlay = true;
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    playButton.style.visibility = 'visible';
    pauseButton.style.visibility = 'hidden';
}

function clickPlay() {
    pausePlay = false;
    const playButton = document.getElementById('play-button');
    const pauseButton = document.getElementById('pause-button');
    playButton.style.visibility = 'hidden';
    pauseButton.style.visibility = 'visible';
    update();
}

function clickRestart() {
    const pauseButton = document.getElementById('pause-button');
    const restartButton = document.getElementById('restart-button');
    pausePlay = false;
    showPopUp = false;
    playerReset();
    updateScore();
    update();
    restartButton.style.visibility = 'hidden';
    pauseButton.style.visibility = 'visible';

}

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) {
        playerMove(-1);
    } else if (event.keyCode === 39) {
        playerMove(1);
    } else if (event.keyCode === 40) {
        playerDrop();
    } else if (event.keyCode === 38) {
        rotatePiece(1);
    }
});

const colors = [
    null,
    '#588C7E',
    '#689581',
    '#ACBC8A',
    '#ECD189',
    '#F2B476',
    '#E99469',
    '#DB6B5C'
];

const arena = createMatrix(21, 27);

const player = {
    position: {x: 0, y: 0},
    matrix: null,
    score: 0,
    lines: 0,
};

playerReset();
updateScore();
update();