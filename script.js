const instances = []

class Movable {
    constructor(
        id,
        x_position = window.innerWidth / 2,
        y_position = window.innerHeight / 2,
        x_velocity  = 0,
        y_velocity  = 0,
        friction    = 0.15
    ) {
        this.element = document.createElement("div")
        this.element.className  = "movable"
        this.element.id         = id
        board.appendChild(this.element)

        this.x_position = x_position
        this.y_position = y_position
        this.x_velocity = x_velocity
        this.y_velocity = y_velocity
        this.friction   = friction

        instances.push(this)
    }

    get width()     { return this.element.offsetWidth }
    get height()    { return this.element.offsetHeight }

    update() {
        this.x_velocity -= this.friction * this.x_velocity
        this.y_velocity -= this.friction * this.y_velocity

        let x_screen_estate = window.innerWidth - this.width
        let y_screen_estate = window.innerHeight - this.height

        if(this.x_position < 0) {
            this.x_position = 0
            this.x_velocity = -this.x_velocity
        }

        if(this.x_position > x_screen_estate) {
            this.x_position = x_screen_estate
            this.x_velocity = -this.x_velocity
        }

        if(this.y_position < 0) {
            this.y_position = 0
            this.y_velocity = -this.y_velocity
        }

        if(this.y_position > y_screen_estate) {
            this.y_position = y_screen_estate
            this.y_velocity = -this.y_velocity
        }

        this.x_position += this.x_velocity
        this.y_position += this.y_velocity

        this.element.style.left = this.x_position + "px"
        this.element.style.top  = this.y_position + "px"
    }

    static update_all() {
        for(let current of instances) {
            if(current.element.id.includes("enemy")) {
                move_toward(current, player)
            }
            
            for(let target of instances) {
                if(current == target) { continue }

                if(current.element.id != "player" && target.element.id != "player") {
                    move_away(current, target)
                }

                if( current.x_position < target.x_position + target.width &&
                    current.x_position + current.width > target.x_position &&
                    current.y_position < target.y_position + target.height &&
                    current.y_position + current.height > target.y_position)
                {
                    let x_pos_diff, y_pos_diff

                    if(current.x_position < target.x_position) {
                        x_pos_diff = current.x_position + current.width - target.x_position
                    } else {
                        x_pos_diff = target.x_position + target.width - current.x_position
                    }

                    if(current.y_position < target.y_position) {
                        y_pos_diff = current.y_position + current.height - target.y_position
                    } else {
                        y_pos_diff = target.y_position + target.height - current.y_position
                    }

                    let x_vel_ave = (current.x_velocity - target.x_velocity) / 2
                    let y_vel_ave = (current.y_velocity - target.y_velocity) / 2

                    if(Math.abs(x_pos_diff) > Math.abs(y_pos_diff)) {
                        current.y_position  += y_pos_diff + 1/16
                        target.y_position   -= y_pos_diff + 1/16
                    } else {
                        current.x_position  += x_pos_diff + 1/16
                        target.x_position   -= x_pos_diff + 1/16
                    }

                    current.x_velocity  -= x_vel_ave
                    current.y_velocity  -= y_vel_ave
                    target.x_velocity   += x_vel_ave
                    target.y_velocity   += y_vel_ave
                }
            }
        }

        for(const e of instances) {
            e.update()
        }
    }
}

function clamp(n, low, high) {
    if(n < low)     { return low }
    if(n > high)    { return high }
    return n
}

function move(movable, x, y) {
    movable.x_velocity += x
    movable.y_velocity += y
}

function move_toward(current, target) {
    function curve(distance) {
        return Math.atan(
            Math.pow(
                (distance - follow_distance) / follow_ease,
                3
            )
        ) * (Math.PI / 5) * move_speed
    }
    
    let x_diff      = target.x_position - current.x_position
    let y_diff      = target.y_position - current.y_position
    let angle       = Math.atan2(y_diff, x_diff)
    let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

    move(
        current,
        Math.cos(angle) * curve(distance),
        Math.sin(angle) * curve(distance)
    )
}

function move_away(current, target) {
    function curve(distance) {
        return -clamp(
            1 / (Math.pow(distance / leave_distance, leave_ease)),
            -move_speed,
            move_speed
        )
    }

    let x_diff      = target.x_position - current.x_position
    let y_diff      = target.y_position - current.y_position
    let angle       = Math.atan2(y_diff, x_diff)
    let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

    move(
        current,
        Math.cos(angle) * curve(distance),
        Math.sin(angle) * curve(distance)
    )
}

function game_loop() {
    function parse_diagonals() {
        let x = move_speed
        let y = move_speed

        if(move_up)     { y = -y }
        if(move_left)   { x = -x }

        move(player, Math.cos(45) * x, Math.cos(45) * y)
    }

    if((move_up || move_down) && (move_left || move_right)) {
        parse_diagonals()
    } else {
        if(move_up)     { move(player, 0, -move_speed) }
        if(move_down)   { move(player, 0, move_speed) }
        if(move_left)   { move(player, -move_speed, 0) }
        if(move_right)  { move(player, move_speed, 0) }
    }

    Movable.update_all()
    window.requestAnimationFrame(game_loop)
}

window.onload = () => {
    let delay = 300

    function clear_loading_screen() {
        let loading_screen  = document.getElementById("loading-screen")
        let loading_bar     = document.getElementById("spinning")
        let loading_message = document.getElementById("message")

        loading_bar.animate     ([{ opacity:0 }], { duration:delay })
        loading_message.animate ([{ opacity:0 }], { duration:delay })
        loading_screen.animate  ([{ opacity:0 }], { duration:delay, delay:delay })

        setTimeout(() => {
                loading_bar.remove();
                loading_message.remove()
            }, delay
        )

        setTimeout(() => { loading_screen.remove() }, delay * 2)

        setTimeout(game_loop, delay)
    }

    clear_loading_screen()

    board   = document.getElementById("board")
    player  = new Movable("player")

    let enemies = []

    for(let i = 0; i < 20; i++) {
        let x, y
        while(true) {
            x = Math.floor(Math.random() * window.innerWidth + 1)
            y = Math.floor(Math.random() * window.innerHeight + 1)

            if( Math.pow(x - player.x_position, 2) +
                Math.pow(y - player.y_position, 2) >
                Math.pow(200, 2)) { break }
        }
        enemies.push(new Movable("enemy" + i, x, y, 0, 0, 0.03))
    }
}

onkeydown = (e) => {
    switch(e.key) {
        case "w": move_up       = true; break
        case "a": move_left     = true; break
        case "s": move_down     = true; break
        case "d": move_right    = true; break
    }
}

onkeyup = (e) => {
    switch(e.key) {
        case "w": move_up       = false; break
        case "a": move_left     = false; break
        case "s": move_down     = false; break
        case "d": move_right    = false; break
    }
}

ontouchstart = (e) => {
    last_swipe_x = e.touches[0].pageX
    last_swipe_y = e.touches[0].pageY
}

ontouchmove = (e) => {
    let new_swipe_x = e.touches[0].pageX
    let new_swipe_y = e.touches[0].pageY
    let diff_x      = new_swipe_x - last_swipe_x
    let diff_y      = new_swipe_y - last_swipe_y

    if( Math.abs(diff_x) < touch_threshold &&
        Math.abs(diff_y) < touch_threshold) { return }

    let angle = Math.atan2(diff_y, diff_x)

    move(
        player,
        clamp(Math.cos(angle) * Math.abs(diff_x) * touch_sensitivity, -player_move_speed, player_move_speed),
        clamp(Math.sin(angle) * Math.abs(diff_y) * touch_sensitivity, -player_move_speed, player_move_speed)
    )

    last_swipe_x = new_swipe_x
    last_swipe_y = new_swipe_y
}

move_up     = false
move_down   = false
move_left   = false
move_right  = false

player_move_speed   = 2
move_speed          = 1
follow_distance     = 150
follow_ease         = 50
leave_distance      = 5
leave_ease          = 5

touch_sensitivity   = 0.3
touch_threshold     = 5

let player,
    board,
    last_swipe_x,
    last_swipe_y
