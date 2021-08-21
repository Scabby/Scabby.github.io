function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function update() {
    window.dispatchEvent(
        new Event("resize")
    )
}

function genBlock(block) {
    let r = Math.floor(Math.random() * 100) + 1
    let text
    let color

    if(r < 70)      { return }
    else if(r < 75) { text = "."; color = "dark_grey" }
    else if(r < 85) { text = ","; color = "grey" }
    else if(r < 95) { text = ":"; color = "light_grey" }
    else if(r < 97) { text = ";"; color = "white" }
    else            { text = "!"; color = "red" }

    block.textContent   = text
    block.className     = color
}

function getBlockHeight() {
    return Math.floor(
        board.offsetHeight /
        helperBlock.offsetHeight
    )
}

function getBlockWidth() {
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
    let height  = getBlockHeight()
    let width   = getBlockWidth()
    let x       = calcInMargin(width, margin)
    let y       = calcInMargin(height, margin)

    for(let h = 0; h < height; h++) {
        let row         = make("div")
        row.id          = "row " + h
        row.className   = "row"

        for(let w = 0; w < width; w++) {
            let block   = make("span")
            block.id    = "block " + w
            row.appendChild(block)
            
            let isWithinRadius = (
                Math.pow(w - x, 2) +
                Math.pow(h - y, 2) <=
                Math.pow(radius, 2)
            )

            if(isWithinRadius) {
                if(w == x && h == y) {
                    block.textContent   = "@"
                    block.className     = "blue"
                }
            } else { genBlock(block) }
        }
        
        board.appendChild(row)
    }
}

function regen() {
    board.replaceChildren()
    board.className = "generating"
    update()

    board.style.height  = getBlockHeight() * helperBlock.offsetHeight
    board.style.width   = getBlockWidth() * helperBlock.offsetWidth

    gen()

    board.className = "generated"
}

function moveUp() {}
function moveDown() {}
function moveLeft() {}
function moveRight() {}

function parseSwipe(e) {
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

onclick         = throttle(regen)
ontouchstart    = throttle(regen)

ontouchmove = (e) => {
    e.preventDefault()
    throttle(parseSwipe, 100, e)
})

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
})

radius         = 7.5
margin         = 15 

