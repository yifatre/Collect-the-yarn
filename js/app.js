'use strict'

const WALL = 'WALL'
const FLOOR = 'FLOOR'
const BALL = 'BALL'
const GAMER = 'GAMER'
const GLUE = 'GLUE'

const GAMER_IMG = '<img src="img/black-cat.png">'
const GLUED_GAMER_IMG = '<img src="img/animal.png">'
const BALL_IMG = '<img src="img/yarn-ball.png">'
const GLUE_IMG = '<img src="img/catnip.png">'

// Model:
var gBoard
var gGamerPos

var gBallsNotCollected
var gBallsCollected

var gBallsInterval
var gGlueInterval
var gGluedTimer = null

function onInitGame() {
    gBallsCollected = 0
    gBallsNotCollected = 0
    gGamerPos = { i: 2, j: 9 }
    gBoard = buildBoard()
    renderBoard(gBoard)
    updateNeighborsCounter()
    gBallsInterval = setInterval(addBalls, 5000)
    setTimeout(() => {
        gGlueInterval = setInterval(addGlue, 5000)

    }, 1500);


}

function buildBoard() {
    // DONE: Create the Matrix 10 * 12 
    // DONE: Put FLOOR everywhere and WALL at edges

    const board = []
    const rowsCount = 10
    const colsCount = 12
    for (var i = 0; i < rowsCount; i++) {
        board.push([])
        for (var j = 0; j < colsCount; j++) {
            board[i][j] = { type: FLOOR, gameElement: null }
            if (i === 0 || i === rowsCount - 1 ||
                j === 0 || j === colsCount - 1) {
                board[i][j].type = WALL
            }
        }
    }

    // DONE: Place the gamer and two balls
    console.log(board)
    board[gGamerPos.i][gGamerPos.j].gameElement = GAMER
    board[5][5].gameElement = BALL
    gBallsNotCollected++
    board[7][2].gameElement = BALL
    gBallsNotCollected++

    // Secret passage
    var i = getRandomInt(1, rowsCount - 1)
    var j = getRandomInt(1, colsCount - 1)
    board[0][j].type = board[rowsCount - 1][j].type = FLOOR
    board[i][0].type = board[i][colsCount - 1].type = FLOOR

    return board
}

// Render the board to an HTML table
function renderBoard(board) {

    const elBoard = document.querySelector('.board')
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            const currCell = board[i][j]
            var cellClass = getClassName({ i, j })
            // console.log('cellClass:', cellClass)

            if (currCell.type === FLOOR) cellClass += ' floor'
            else if (currCell.type === WALL) cellClass += ' wall'

            strHTML += `\t<td class="cell ${cellClass}" onclick="moveTo(${i},${j})" >\n`

            if (currCell.gameElement === GAMER) {
                strHTML += GAMER_IMG
            } else if (currCell.gameElement === BALL) {
                strHTML += BALL_IMG
            }

            strHTML += '\t</td>\n'
        }
        strHTML += '</tr>\n'
    }
    // console.log(strHTML)
    elBoard.innerHTML = strHTML
}

// Move the player to a specific location
function moveTo(i, j) {
    const targetCell = gBoard[i][j]
    if (targetCell.type === WALL) return
    if (Date.now() - gGluedTimer < 3000) return

    // Calculate distance to make sure we are moving to a neighbor cell
    const iAbsDiff = Math.abs(i - gGamerPos.i)
    const jAbsDiff = Math.abs(j - gGamerPos.j)
    // console.log(iAbsDiff, jAbsDiff)
    // If the clicked Cell is one of the four allowed (up, right, down, left)
    // if ((iAbsDiff === 1 && jAbsDiff === 0) || (jAbsDiff === 1 && iAbsDiff === 0)) {

    if (iAbsDiff + jAbsDiff === 1 ||
        (gGamerPos.i === 0 && gGamerPos.j === j && i === gBoard.length - 1) ||
        (gGamerPos.i === gBoard.length - 1 && gGamerPos.j === j && i === 0) ||
        (gGamerPos.j === 0 && gGamerPos.i === i && j === gBoard[0].length - 1) ||
        (gGamerPos.j === gBoard[0].length - 1 && gGamerPos.i === i && j === 0)) {

        var img = GAMER_IMG
        if (targetCell.gameElement === BALL) onBallCollected()
        else if (targetCell.gameElement === GLUE) {
            gGluedTimer = Date.now()
            setTimeout(() => {
                clearTimeout(gGluedTimer)
                renderCell({ i, j }, GAMER_IMG)
            }, 3000,)
            const glueSound = new Audio('audio/little-cat-pain-meow.mp3')
            glueSound.play()
            img = GLUED_GAMER_IMG
        }


        // DONE: Move the gamer
        // REMOVE FROM
        // MODEL
        gBoard[gGamerPos.i][gGamerPos.j].gameElement = null
        // DOM
        renderCell(gGamerPos, '')

        // ADD TO
        // MODEL
        gGamerPos.i = i
        gGamerPos.j = j
        gBoard[i][j].gameElement = GAMER
        // DOM
        renderCell(gGamerPos, img)
        updateNeighborsCounter()

    } else {
        console.log('TOO FAR', iAbsDiff, jAbsDiff)
    }

}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
    const cellSelector = '.' + getClassName(location)
    const elCell = document.querySelector(cellSelector)
    elCell.innerHTML = value
}

function isEmptyFloor(location) {
    const cell = gBoard[location.i][location.j]
    return !cell.gameElement && cell.type === FLOOR
}

function addBalls() {
    var isEmptyCell = false
    var counter = 0
    while (!isEmptyCell) {
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard[0].length)
        isEmptyCell = isEmptyFloor({ i, j })
        counter++
        if (counter > gBoard.length * gBoard[0].length) {
            clearInterval(gBallsInterval)
            break
        }
    }
    gBoard[i][j].gameElement = BALL
    renderCell({ i, j }, BALL_IMG)
    gBallsNotCollected++
    updateNeighborsCounter()
}

function addGlue() {
    var isEmptyCell = false
    var counter = 0
    while (!isEmptyCell) {
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard[0].length)
        isEmptyCell = isEmptyFloor({ i, j })
        counter++
        if (counter > gBoard.length * gBoard[0].length) {
            clearInterval(gGlueInterval)
            break
        }
    }
    gBoard[i][j].gameElement = GLUE
    renderCell({ i, j }, GLUE_IMG)

    setTimeout(removeGlue, 3000, { i, j })
}

function removeGlue(location) {

    if (gBoard[location.i][location.j].gameElement === GLUE) {
        gBoard[location.i][location.j].gameElement = null
        renderCell({ i: location.i, j: location.j }, '')
    }

}

function onBallCollected() {
    console.log('Collecting!')
    gBallsCollected++
    gBallsNotCollected--
    console.log('gBallsCollected:	', gBallsCollected)
    updateBallsCounter()
    if (gBallsNotCollected === 0) onWin()
    const ballSound = new Audio('audio/purr.mp3')
    ballSound.play()
}

function onWin() {
    clearInterval(gBallsInterval)
    clearInterval(gGlueInterval)
    const winSound = new Audio('audio/win.wav')
    winSound.play()
    openModal()

}

function updateNeighborsCounter() {
    var counter = 0
    for (var i = gGamerPos.i - 1; i <= gGamerPos.i + 1; i++) {
        for (var j = gGamerPos.j - 1; j <= gGamerPos.j + 1; j++) {
            if (i < 0 || i >= gBoard.length || j < 0 || j >= gBoard[0].length || (i === gGamerPos.i && i === gGamerPos.j)) continue
            const cell = gBoard[i][j]
            if (cell.gameElement === BALL) counter++
        }
    }

    const elCounter = document.querySelector('.counter-neighbors')
    elCounter.innerHTML = `${counter}`
    return counter
}

function updateBallsCounter() {
    const elCounter = document.querySelector('.counter-collected')
    elCounter.innerHTML = `${gBallsCollected}`
}

function openModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.remove('hide')
}

function closeModal() {
    const elModal = document.querySelector('.modal')
    elModal.classList.add('hide')
}

function onRestartClicked() {
    closeModal()
    onInitGame()
}



// Move the player by keyboard arrows
function onHandleKey(event) {
    if (!gBallsNotCollected) return
    var i = gGamerPos.i
    var j = gGamerPos.j
    switch (event.key) {
        case 'ArrowLeft':
            if (j === 0) j = gBoard[0].length
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            if (j === gBoard[0].length - 1) j = -1
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            if (i === 0) i = gBoard.length
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            if (i === gBoard.length - 1) i = -1
            moveTo(i + 1, j)
            break
    }
}

// Returns the class name for a specific cell
function getClassName(location) {
    return `cell-${location.i}-${location.j}`
}

