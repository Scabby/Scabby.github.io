function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function getBlock(y, x) {
    let blocks = get(rowPre + y).children
    
    for(let i = 0; i < blocks.length; i++) {
        if(blocks[i].id = blockPre + x) {
            return blocks[i]
        }
    }
}

function update(element) {
    let display             = element.style.display
    element.style.display   = "none"
    element.style.display   = display
}

function calcBlock(block, value) {
    let text, color
    
    if(value < 70)      { text = ""; color = "" }
    else if(value < 75) { text = "."; color = "dark_grey" }
    else if(value < 85) { text = ","; color = "grey" }
    else if(value < 95) { text = ":"; color = "light_grey" }
    else if(value < 97) { text = ";"; color = "white" }
    else                { text = "!"; color = "red" }
    
    block.textContent   = text
    block.className     = color
}

function genBlock(block) {
    let r = Math.floor(Math.random() * 100) + 1
    calcBlock(block, r)
}

function makePlayer(block) {
    playerBlock         = block
    block.textContent   = "@"
    block.className     = "blue"
}

function getBoardHeight() {
    return Math.floor(
        board.offsetHeight /
        helperBlock.offsetHeight
    )
}

function getBoardWidth() {
    return Math.floor(
        board.offsetWidth /
        helperBlock.offsetWidth
    )
}

function calcInMargin(size, margin) {
    if(size <= margin * 2) {
        return Math.floor(size / 2)
    } else {
        return Math.round(
            Math.random() *
            (size - margin * 2) +
            margin
        )
    }
}

function gen() {
    playerY = calcInMargin(boardHeight, margin)
    playerX = calcInMargin(boardWidth, margin)

    for(let h = 0; h < boardHeight; h++) {
        let row         = make("div")
        row.id          = rowPre + h
        row.className   = rowPre

        for(let w = 0; w < boardWidth; w++) {
            let block   = make("span")
            block.id    = blockPre + w
            row.appendChild(block)
            
            let isWithinRadius = (
                Math.pow(h - playerY, 2) +
                Math.pow(w - playerX, 2) <=
                Math.pow(radius, 2)
            )

            if(isWithinRadius) {
                if(h == playerY && w == playerX) {
                    makePlayer(block)
                }
            } else { genBlock(block) }
        }
        
        board.appendChild(row)
    }
}

function regen() {
    board.replaceChildren()
    board.className = "generating"
    update(board)

    window.requestAnimationFrame(() => {
        boardHeight         = getBoardHeight()
        boardWidth          = getBoardWidth()
        board.style.height  = boardHeight * helperBlock.offsetHeight
        board.style.width   = boardWidth * helperBlock.offsetWidth

        gen()
        
        board.className = "generated"
    })
}

function move(y, x) {
    let nextY = playerY + y
    let nextX = playerX + x

    if(nextY >= 0 && nextY < boardHeight &&
       nextX >= 0 && nextX < boardWidth)
    {
        calcBlock(playerBlock, 0)
        
        playerY = nextY
        playerX = nextX

        makePlayer(getBlock(PlayerY, playerX))
    }
}

function moveUp()       { move(-1, 0) }
function moveDown()     { move(1, 0) }
function moveLeft()     { move(0, -1) }
function moveRight()    { move(0, 1) }

function throttle(func, wait = 500) {
    let shouldWait
    
    return (... args) => {
        if(!shouldWait) {
            func.apply(this, args)
            shouldWait = true

            setTimeout(() => { shouldWait = false }, wait)
        }
    }
}

onclick = throttle(regen)

window.addEventListener("touchstart", (e) => {
    e.preventDefault()
}, { passive: false })

window.addEventListener("touchend", (e) => {
    e.preventDefault()
}, { passive: false })

window.addEventListener("touchmove", (e) => {
    e.preventDefault()
    
    parseSwipe = (e) => {
        let lastY, lastX

        let touch       = e.originalEvent.touches[0]
        let currentY    = touch.clientY
        let currentX    = touch.clientX
        let deltaX      = currentX - lastX
        let deltaY      = currentY - lastY
        
        let isYSwipe    = Math.abs(deltaY) > Math.abs(deltaX)
        
        if(isYSwipe) {
            let isUp = currentY < lastY

            if(isUp)    { moveUp() }
            else        { moveDown() }
        } else {
            let isLeft = currentX < lastX

            if(isLeft)  { moveLeft() }
            else        { moveRight() }
        }
        
        lastY = currentY
        lastX = currentX
    }
    
    throttle(parseSwipe, 100, e)
}, { passive: false })

onkeydown = (e) => {
    let key = e.code
    
    switch(key) {
        case "w": moveUp();     break
        case "a": moveLeft();   break
        case "s": moveDown();   break
        case "d": moveRight();  break
    }
}

onload = () => {
    board          = get("board")
    helperBlock    = get("helper_block")
    regen()
}

radius      = 7.5
margin      = 15
rowPre      = "row"
blockPre    = "block"

let boardWidth,
    boardHeight,
    playerY,
    playerX,
    playerBlock
