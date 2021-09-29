function get(id) {
    return document.getElementById(id)
}

const instances = []

class Movable {
    constructor(
        id,
        x_position  = window.innerWidth / 2 - movable_helper.offsetWidth,
        y_position  = window.innerHeight / 2 - movable_helper.offsetHeight,
        x_velocity  = 0,
        y_velocity  = 0,
        health      = 100,
        friction    = 0.15,
        move_speed  = 2
    ) {
        this.element = document.createElement("div")
        this.element.className  = "movable"
        this.element.id         = id
        board.appendChild(this.element)

        this.x_position = x_position
        this.y_position = y_position
        this.x_velocity = x_velocity
        this.y_velocity = y_velocity
        this.health     = health
        this.friction   = friction
        this.move_speed = move_speed

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
            this.x_position = 1
            this.x_velocity = -this.x_velocity
        }

        if(this.x_position > x_screen_estate) {
            this.x_position = x_screen_estate - 1
            this.x_velocity = -this.x_velocity
        }

        if(this.y_position < 0) {
            this.y_position = 1
            this.y_velocity = -this.y_velocity
        }

        if(this.y_position > y_screen_estate) {
            this.y_position = y_screen_estate - 1
            this.y_velocity = -this.y_velocity
        }

        this.x_position += this.x_velocity
        this.y_position += this.y_velocity

        this.element.style.left = this.x_position + "px"
        this.element.style.top  = this.y_position + "px"
    }

    get_force_toward(target) {
        function curve(distance, move_speed) {
            return Math.atan(
                Math.pow(
                    (distance - (follow_distance * width_sum)) / follow_ease,
                    3
                )
            ) * (Math.PI / 5) * move_speed
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let width_sum   = this.width + target.width
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed),
            Math.sin(angle) * curve(distance, this.move_speed)
        ]
    }

    get_force_away(target) {
        function curve(distance, move_speed, width_sum) {
            return -clamp(
                1 / (
                    Math.pow(distance /(leave_distance * width_sum),
                    leave_ease)
                ),
                move_speed
            )
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let width_sum   = this.width + target.width
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed, width_sum),
            Math.sin(angle) * curve(distance, this.move_speed, width_sum)
        ]
    }

    move(x, y) {
        this.x_velocity += x
        this.y_velocity += y
    }

    move_toward(target) {
        let [x, y] = get_force_toward(target)
        this.move(x, y)
    }

    move_away(target) {
        let [x, y] = get_force_away(target)
        this.move(x, y)
    }

    static update_all() {
        let enemy_count = 0

        for(let current of instances) {
            let new_x_move_force = 0
            let new_y_move_force = 0

            function add_force(force) {
                let [x, y] = force
                new_x_move_force += x
                new_y_move_force += y
            }

            if(current.element.id.includes("enemy")) {
                add_force(current.get_force_toward(player))
                enemy_count++
            }

            for(let target of instances) {
                if(current == target) { continue }

                if(current.element.id != "player" && target.element.id != "player") {
                    add_force(current.get_force_away(target))
                }

                if( current.x_position < target.x_position + target.width &&
                    current.x_position + current.width > target.x_position &&
                    current.y_position < target.y_position + target.height &&
                    current.y_position + current.height > target.y_position)
                {
                    let x_diff =    (current.x_position + current.width / 2) -
                                    (target.x_position + target.width / 2)

                    let y_diff =    (current.y_position + current.height / 2) -
                                    (target.y_position + target.height / 2)

                    let x_overlap, y_overlap

                    if(x_diff > 0) {
                        x_overlap = target.x_position +
                                    target.width -
                                    current.x_position
                    } else {
                        x_overlap = -(current.x_position +
                                    current.width -
                                    target.x_position)
                    }

                    if(y_diff > 0) {
                        y_overlap = target.y_position +
                                    target.height -
                                    current.y_position
                    } else {
                        y_overlap = -(current.y_position +
                                    current.height -
                                    target.y_position)
                    }

                    if(Math.abs(x_diff) < Math.abs(y_diff)) {
                        current.y_position  += y_overlap / 2
                        target.y_position   -= y_overlap / 2
                    } else {
                        current.x_position  += x_overlap / 2
                        target.x_position   -= x_overlap / 2
                    }

                    let curr_x_velocity = current.x_velocity
                    let curr_y_velocity = current.y_velocity

                    current.x_velocity  = target.x_velocity
                    current.y_velocity  = target.y_velocity
                    target.x_velocity   = curr_x_velocity
                    target.y_velocity   = curr_y_velocity
                }
            }

            current.x_velocity += clamp(new_x_move_force, current.move_speed)
            current.y_velocity += clamp(new_y_move_force, current.move_speed)
        }

        for(const e of instances) {
            e.update()
        }

        enemy_counter.innerHTML = "enemies: " + enemy_count
    }
}

function clamp(n, max) {
    if(n < -max)    { return -max }
    if(n > max)     { return max }
    return n
}

function game_loop() {
    if(!is_paused) {
        window.requestAnimationFrame(game_loop)
    }

    function parse_diagonals() {
        let x = player.move_speed
        let y = player.move_speed

        let angle = Math.atan2(y, x)

        if(move_up)     { y = -y }
        if(move_left)   { x = -x }

        player.move(Math.cos(angle) * x, Math.sin(angle) * y)
    }

    if((move_up || move_down) && (move_left || move_right)) {
        parse_diagonals()
    } else {
        if(move_up)     { player.move(0, -player.move_speed) }
        if(move_down)   { player.move(0, player.move_speed) }
        if(move_left)   { player.move(-player.move_speed, 0) }
        if(move_right)  { player.move(player.move_speed, 0) }
    }

    Movable.update_all()

    let speed_count = Math.sqrt(
        Math.pow(player.x_velocity, 2) +
        Math.pow(player.y_velocity, 2)
    ).toFixed(2)

    let angle_count

    if( Math.abs(player.x_velocity).toFixed(2) > 0 ||
        Math.abs(player.y_velocity).toFixed(2) > 0
    ) {
        angle_count = (
            Math.atan2(player.y_velocity, player.x_velocity) *
            (180 / Math.PI)
        ).toFixed(2)
    } else {
        angle_count = "NaN"
    }

    health_counter.innerHTML    = "health: " + player.health
    x_pos_counter.innerHTML     = "x pos: " + player.x_position.toFixed(2)
    y_pos_counter.innerHTML     = "y pos: " + player.y_position.toFixed(2)
    speed_counter.innerHTML     = "speed: " + speed_count
    angle_counter.innerHTML     = "angle: " + angle_count

    if(player.health > 50)          { health_counter.className = "green" }
    else if(player.health <= 10)    { health_counter.className = "red" }
    else                            { health_counter.className = "yellow" }

    window.requestAnimationFrame(game_loop)
}

window.onload = () => {
    function close_loading_screen() {
        let delay = 300

        let loading_screen  = get("loading-screen")
        let loading_bar     = get("spinning")
        let loading_message = get("message")

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

    function spawn_enemies(n = 0) {
        if(n >= enemy_count) { return }

        let fail_count = 0

        while(true) {
            if(fail_count > 10) { break }

            let x = Math.floor(Math.random() * window.innerWidth) - movable_helper.offsetWidth
            let y = Math.floor(Math.random() * window.innerHeight) - movable_helper.offsetHeight

            if( Math.pow(x - player.x_position, 2) +
                Math.pow(y - player.y_position, 2) >
                Math.pow(follow_distance * (player.width * 2), 2)
            ) {
                new Movable("enemy" + n, x, y); break
            } else {
                fail_count++
            }
        }

        setTimeout(() => spawn_enemies(n + 1), 200)
    }

    close_loading_screen()

    board           = get("board")
    health_counter  = get("health-counter")
    x_pos_counter   = get("x-pos-counter")
    y_pos_counter   = get("y-pos-counter")
    speed_counter   = get("speed-counter")
    angle_counter   = get("angle-counter")
    enemy_counter   = get("enemy-counter")
    movable_helper  = get("movable-helper")
    player          = new Movable("player")

    setTimeout(spawn_enemies, 2000)
}

function handle_key(e, start_move) {
    let k = e.key

    if(k == "tab") {
        is_paused = !is_paused
        e.preventDefault()
    }

    if(is_paused) { return }

    switch(k) {
        case "w":
        case "ArrowUp":     move_up     = start_move;
        break

        case "a":
        case "ArrowLeft":   move_left   = start_move;
        break

        case "s":
        case "ArrowDown":   move_down   = start_move;
        break

        case "d":
        case "ArrowRight":  move_right  = start_move;
        break
    }
}

onkeydown   = (e) => { handle_key(e, true) }
onkeyup     = (e) => { handle_key(e, false) }

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

    player.move(
        clamp(Math.cos(angle) * Math.abs(diff_x) * touch_sensitivity, player.move_speed),
        clamp(Math.sin(angle) * Math.abs(diff_y) * touch_sensitivity, player.move_speed)
    )

    last_swipe_x = new_swipe_x
    last_swipe_y = new_swipe_y
}

is_paused = false

move_up     = false
move_down   = false
move_left   = false
move_right  = false

enemy_count         = 50
enemy_spawn_delay   = 200

follow_distance     = 7
follow_ease         = 50
leave_distance      = 0.7
leave_ease          = 5

touch_sensitivity   = 0.3
touch_threshold     = 5

let player,
    board,
    health_counter,
    x_pos_counter,
    y_pos_counter,
    speed_counter,
    angle_counter,
    enemy_counter,
    last_swipe_x,
    last_swipe_y
