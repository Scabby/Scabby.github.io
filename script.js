function getFontSize() {
    return parseFloat(
        window.getComputedStyle(
            document.getElementById("board"),
            null
        ).getPropertyValue('font-size')
    )
}

// bad usage of font size
function getCharWidth() {
    return Math.floor(window.innerWidth / getFontSize()); // count for two characters' worth of width
}

// also bad usage of font size
function getCharHeight() {
    return Math.floor(window.innerHeight / getFontSize());
}

function genChar() {
    let random = Math.floor(Math.random() * 3)

    switch(random) {
        case 0:     return " "
        case 1:     return "#"
        case 2:     return "/"
    }
}

function generateBoard(charHeight, charWidth) {
    let out = Array(charHeight)
    for(let i = 0; i < out.length; i++) {
        out[i] = Array(charWidth)
    }

    for(let h = 0; h < out.length; h++) {
        for(let w = 0; w < out[h].length; w++) {
            out[h][w] = genChar()
        }
    }

    return out
}

function boardToStr(board) {
    let out = ""

    for(let h = 0; h < board.length; h++) {
        for(let w = 0; w < board[h].length; w++) {
            out += board[h][w]
          
            if(w < board[h].length - 1) { out += " " }
            else                        { out += "\n" }
        }
    }

    return out
}

function displayBoard(boardStr) {
    document.getElementById("board").innerHTML = boardStr
}

function nextFrame() {
    setTimeout(frame, 500)
}



let lastCharHeight  = 0
let lastCharWidth   = 0

function frame() {
    let charHeight  = getCharHeight()
    let charWidth   = getCharWidth()
    
    board = generateBoard(charHeight, charWidth)
    displayBoard(boardToStr(board))

    nextFrame()
}

nextFrame()
