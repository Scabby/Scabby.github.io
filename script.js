function get(id)    { return document.getElementById(id) }
function make(type) { return document.createElement(type) }

function get_x_screen_area(element) { return window.innerWidth - element.offsetWidth }
function get_y_screen_area(element) { return window.innerHeight - element.offsetHeight }

function clamp(n, max) {
    if(n < -max)    { return -max }
    if(n > max)     { return max }
    return n
}

function create_odd_exponent(deviation, precision) {
    return deviation * 2/Math.pow(5, precision) + 1
}

function find_class(element, name) {
    let names = element.className.split(" ")
    let string_index = 0

    for(i = 0; i < names.length; i++) {
        if(names[i] == name) { return [true, string_index] }
        string_index += names[i].length + 1
    }
    return [false, -1]
}

function add_class(element, name) {
    let names       = element.className
    let [found, _]  = find_class(element, name)

    if(found) { return }

    if(names.length == 0)   { element.className = name }
    else                    { element.className += " " + name }
}

function remove_class(element, name) {
    let names           = element.className
    let [found, index]  = find_class(element, name)

    if(!found) { return }

    if(names.includes(" ")) {
        if(index == 0) {
            element.className = names.substring(name.length)
        } else {
            element.className = names.substring(0, index - 1) +
                                names.substring(index + name.length)
        }
    } else { element.className = "" }
}



var fading_out = []

function fade_out(element, duration = fade_delay, delay = 0, easing = "ease-in-out") {
    let fade_animation = element.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], { duration: duration, delay: delay, easing: easing })

    if(fading_out.includes(element))    { return }
    else                                { fading_out.push(element) }

    setTimeout(() => {
        if(!fading_out.includes(element)) {
            fade_animation.cancel()
        } else {
            element.style.display = "none"
        }
    }, duration)
}

function fade_in(element, duration = fade_delay, delay = 0, easing = "ease-in-out") {
    element.style.display = "unset"

    let fade_animation = element.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], { duration: duration, delay: delay, easing: easing })

    if(fading_out.includes(element)) {
        fading_out.splice(
            fading_out.indexOf(element),
            1
        )
    }

    setTimeout(() => {
        if(fading_out.includes(element)) {
            fade_animation.cancel()
        }
    }, duration)
}


function toggle_pause() {
    let animations = document.getAnimations()

    if(pause_screen_is_hidden) {
        animations.forEach(animation => animation.pause())

        if(!info_panel_is_hidden) { fade_out(info_panel) }

        info_button.disabled = true

        fade_in(pause_screen)
        fade_out(info_button)

        // adds colored formatting
        text_box.className = test_command(text_box.value.split(" "))

        setTimeout(() => {
            text_box.disabled           = false
            text_box_button.disabled    = false
            text_box.focus()
            info_button.style.display   = "none"
        }, 10)

        setTimeout(() => {
            button_container_background.style.display = "unset"
        }, fade_delay)

        is_paused = true
    } else {
        animations.forEach(animation => animation.play())

        if(!info_panel_is_hidden) { fade_in(info_panel) }

        fade_out(pause_screen)
        fade_in(info_button)

        text_box.disabled           = true
        text_box_button.disabled    = true
        text_box.blur()
        button_container_background.style.display = "none"

        setTimeout(() => {
            is_paused                   = false
            info_button.disabled        = false
            text_box.className          = "" // removes colored formatting
            info_button.style.display   = "unset"
        }, fade_delay)
    }

    pause_screen_is_hidden = !pause_screen_is_hidden
}

function toggle_info_panel() {
    if(info_panel_is_hidden)    { fade_in(info_panel) }
    else                        { fade_out(info_panel) }
    info_panel_is_hidden = !info_panel_is_hidden
}

function toggle_help_panel() {
    help_panel_container.style.display = "unset"

    let help_height     = help_panel.offsetHeight
    let box_height      = text_box_container.offsetHeight
    let menu_bar_space  = "(var(--size) * 3.5)"
    let margin          = "((100% - " + help_height+"px - " + box_height + "px) / 3)"
    let min_box_top     = "(var(--size) + " + menu_bar_space + ")"
    let min_help_top    = "calc(var(--size) + "+min_box_top+" + " + box_height + "px)"
    let box_top         = "max(" + min_box_top + ", calc(" + margin + "))"
    let help_top        = "max(" + min_help_top + ", calc((" + margin + " * 2) + var(--size) * 2.5))"

    if(help_panel_is_hidden) {
        fade_in(help_panel_container, fade_delay * 2)

        text_box_container.animate([
            { top: text_box_container.offsetTop },
            { top: box_top }
        ], { duration: fade_delay * 2, easing: "ease-in-out" })

        help_panel_container.animate([
            { top: "100%" },
            { top: help_top }
        ], { duration: fade_delay * 2, easing: "ease-in-out" })

        setTimeout(() => {
            text_box_container.style.top    = box_top
            help_panel_container.style.top  = help_top
            pause_screen.style.overflow     = "auto"
        }, fade_delay * 2)
    } else {
        fade_out(help_panel_container, fade_delay * 2)

        text_box_container.style.top    = ""
        help_panel_container.style.top  = ""
        pause_screen.style.overflow     = "hidden"

        text_box_container.animate([
            { top: box_top },
            { top: text_box_container.offsetTop }
        ], { duration: fade_delay * 2, easing: "ease-in-out" })

        help_panel_container.animate([
            { top: help_top },
            { top: "100%" }
        ], { duration: fade_delay * 2, easing: "ease-in-out" })
    }

    help_panel_is_hidden = !help_panel_is_hidden
}



movable_instances = []

class Movable {
    constructor(
        id,

        x_position = (
            Math.random() *
            get_x_screen_area(movable_helper)
        ) - get_x_screen_area(movable_helper) / 2,

        y_position = (
            Math.random() *
            get_y_screen_area(movable_helper)
        ) - get_y_screen_area(movable_helper) / 2,

        x_velocity      = 0,
        y_velocity      = 0,
        health          = 100,
        max_health      = 100,
        ammunition      = 10,
        max_ammunition  = 10,
        m_class         = "default",
        fire_rate       = 1,
        friction        = 0.15,
        move_speed      = 1.1,
        is_alive        = true
    ) {
        this.element            = make("div")
        this.element.className  = "movable " + m_class
        this.element.id         = id
        board.appendChild(this.element)

        if(is_paused) {
            this.element.getAnimations().forEach(a => a.pause())
        }

        this.x_position             = x_position
        this.y_position             = y_position
        this.previous_x_position    = this.x_position
        this.previous_y_position    = this.y_position
        this.x_velocity             = x_velocity
        this.y_velocity             = y_velocity
        this.health                 = health
        this.last_health            = health
        this.max_health             = max_health
        this.ammunition             = ammunition
        this.max_ammunition         = max_ammunition
        this.m_class                = m_class
        this.fire_rate              = fire_rate
        this.friction               = friction
        this.move_speed             = move_speed
        this.is_alive               = is_alive

        movable_instances.push(this)
    }

    get width()     { return this.element.offsetWidth }
    get height()    { return this.element.offsetHeight }

    update() {
        if(this.health <= 0) {
            if(this.is_alive) {
                this.is_alive = false

                this.element.animate([
                    { backgroundColor: getComputedStyle(this.element).backgroundColor },
                    { backgroundColor: "var(--grey)" }
                ], { duration: fade_delay, easing: "ease-in-out" })

                setTimeout(() => add_class(this.element, "dead"), fade_delay)
            }
        } else {
            if(!this.is_alive) {
                this.is_alive = true

                remove_class(this.element, "dead")

                this.element.animate([
                    { backgroundColor: "var(--grey)" },
                    { backgroundColor: getComputedStyle(this.element).backgroundColor }
                ], { duration: fade_delay, easing: "ease-in-out" })
            }
        }

        if(this.last_health != this.health) {
            this.element.style = "filter: saturate(" + this.health / this.max_health + ")"

            this.element.animate([
                { filter: "saturate(" + this.last_health / this.max_health + ")" },
                { filter: "saturate(" + this.health / this.max_health + ")" }
            ], { duration: fade_delay, easing: "ease-in-out" })
        }

        this.x_velocity -= this.friction * this.x_velocity
        this.y_velocity -= this.friction * this.y_velocity

        let x_screen_area = get_x_screen_area(this.element) / 2
        let y_screen_area = get_y_screen_area(this.element) / 2

        if(this.x_position < -x_screen_area) {
            this.x_position = -x_screen_area
            this.x_velocity = Math.abs(this.x_velocity)
        } else if(this.x_position > x_screen_area) {
            this.x_position = x_screen_area
            this.x_velocity = -Math.abs(this.x_velocity)
        }

        if(this.y_position < -y_screen_area) {
            this.y_position = -y_screen_area
            this.y_velocity = Math.abs(this.y_velocity)
        } else if(this.y_position > y_screen_area) {
            this.y_position = y_screen_area
            this.y_velocity = -Math.abs(this.y_velocity)
        }

        this.x_position += this.x_velocity
        this.y_position += this.y_velocity

        this.element.style.transform = "translate(" +
            this.x_position + "px," +
            this.y_position + "px)"

        this.last_health = this.health
    }

    get_force_toward(target) {
        function curve(distance, move_speed) {
            return Math.atan(
                Math.pow((distance - follow_distance) / follow_ease, 3)
            ) * (Math.PI / 5) * move_speed
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed),
            Math.sin(angle) * curve(distance, this.move_speed)
        ]
    }

    get_force_away(target) {
        function curve(distance, move_speed) {
            return -clamp(
                1 / (Math.pow(distance / leave_distance, leave_ease)),
                move_speed
            )
        }

        let x_diff      = target.x_position - this.x_position
        let y_diff      = target.y_position - this.y_position
        let angle       = Math.atan2(y_diff, x_diff)
        let distance    = Math.sqrt(Math.pow(y_diff, 2) + Math.pow(x_diff, 2))

        return [
            Math.cos(angle) * curve(distance, this.move_speed),
            Math.sin(angle) * curve(distance, this.move_speed)
        ]
    }

    move(x, y) {
        this.x_velocity += x
        this.y_velocity += y
    }

    heal(amount)    { this.health += amount }
    harm(amount)    { this.health -= amount }
    kill()          { this.health = 0}
    revive()        { this.health = this.max_health }

    give_ammo(amount)   { this.ammo += amount }
    take_ammo(amount)   { this.ammo -= amount }

    move_toward(target) {
        let [x, y] = get_force_toward(target)
        this.move(x, y)
    }

    move_away(target) {
        let [x, y] = get_force_away(target)
        this.move(x, y)
    }
}

function update_all() {
    enemy_count = 0

    for(let current of movable_instances) {
        let new_x_move_force = 0
        let new_y_move_force = 0

        function add_force(force) {
            let [x, y] = force
            new_x_move_force += x
            new_y_move_force += y
        }

        if(current.element.id == "enemy" && current.is_alive && player.is_alive) {
            enemy_count++
            add_force(current.get_force_toward(player))
        }

        for(let target of movable_instances) {
            if(current == target) { continue }

            if( current.element.id == "enemy" &&
                target.element.id != "player" &&
                current.is_alive
            ) {
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

                let average_x_vel   = (target.x_velocity + current.x_velocity) / 2
                let average_y_vel   = (target.y_velocity + current.y_velocity) / 2

                current.x_velocity  = average_x_vel - average_x_vel * 0.1
                current.y_velocity  = average_y_vel - average_y_vel * 0.1
                target.x_velocity   = average_x_vel + average_x_vel * 0.1
                target.y_velocity   = average_y_vel + average_y_vel * 0.1
            }
        }

        current.x_velocity += clamp(new_x_move_force, current.move_speed)
        current.y_velocity += clamp(new_y_move_force, current.move_speed)
    }

    for(const e of movable_instances) {
        e.update()
    }
}

function physics_loop() {
    let start_tick_time = Date.now()

    if(is_paused) {
        setTimeout(physics_loop, game_tick)
        return
    }

    if( wave_is_spawning &&
        current_enemy_spawn_timer > enemy_spawn_delay &&
        enemy_count < enemy_spawn_cap
    ) {
        new Movable("enemy")
        current_enemy_spawn_timer = 0

        if(enemy_count == enemy_spawn_cap) {
            wave_is_spawning = false
        }
    }

    if(current_enemy_spawn_timer <= enemy_spawn_delay) {
        current_enemy_spawn_timer++
    }

    if(player.is_alive) {
        if((move_up || move_down) && (move_left || move_right)) {
            let x = player.move_speed
            let y = player.move_speed

            let angle = Math.atan2(y, x)

            if(move_up)     { y = -y }
            if(move_left)   { x = -x }

            player.move(Math.cos(angle) * x, Math.sin(angle) * y)
        } else {
            if(move_up)     { player.move(0, -player.move_speed) }
            if(move_down)   { player.move(0, player.move_speed) }
            if(move_left)   { player.move(-player.move_speed, 0) }
            if(move_right)  { player.move(player.move_speed, 0) }
        }
    }

    update_all()

    calc_period = Date.now() - start_tick_time

    setTimeout(physics_loop, game_tick - calc_period)
    if(calc_period < game_tick) { last_tick_duration = game_tick }
    else                        { last_tick_duration = calc_period }
}

function update_info_panel() {
    let load    = calc_period / game_tick
    let tps     = 1000 / last_tick_duration
    let health  = player.health / player.max_health

    if((load > 1 || tps < 55) && wave_is_spawning) {
        wave_is_spawning = false
    }


    if(info_panel_is_hidden) { return }

    let speed_count = Math.sqrt(
        Math.pow(player.x_velocity, 2) +
        Math.pow(player.y_velocity, 2)
    )

    let angle_count

    if(speed_count.toFixed(decimal_limit) > 0) {
        angle_count = (
            Math.atan2(player.y_velocity, player.x_velocity) *
            (180 / Math.PI)
        )
    } else {
        angle_count = NaN
    }

    health_counter.innerHTML    = "health:    " + player.health
    ammo_counter.innerHTML      = "ammo:      " + player.ammunition

    class_counter.innerHTML     = "class:     " + player.m_class
    x_pos_counter.innerHTML     = "x pos:     " + player.x_position.toFixed(decimal_limit)
    y_pos_counter.innerHTML     = "y pos:     " + player.y_position.toFixed(decimal_limit)
    speed_counter.innerHTML     = "speed:     " + speed_count.toFixed(decimal_limit)
    angle_counter.innerHTML     = "angle:     " + angle_count.toFixed(decimal_limit)

    enemy_counter.innerHTML     = "enemies:   " + enemy_count
    element_counter.innerHTML   = "elements:  " + movable_instances.length

    if(Date.now() - time_of_last_tps_counter_update >= 250) {
        if(fps > tps) { fps = tps }
        tps_counter.innerHTML       = "tps:       " + tps.toFixed()
        fps_counter.innerHTML       = "fps:       " + fps.toFixed()
        load_counter.innerHTML      = "load:      " + load.toFixed(decimal_limit)
        time_of_last_tps_counter_update = Date.now()
    }


    if(health > 0.75)       { health_counter.className = "green" }
    else if(health > 0.50)  { health_counter.className = "yellow" }
    else if(health > 0.25)  { health_counter.className = "orange" }
    else if(health > 0)     { health_counter.className = "red" }
    else                    { health_counter.className = "pre-white" }
}

function render_loop() {
    if(is_paused) {
        requestAnimationFrame(render_loop)
        return
    }

    fps = 1000 / (Date.now() - start_render_time)
    update_info_panel()

    start_render_time = Date.now()
    requestAnimationFrame(render_loop)
    frames_drawn += 1
}



window.onload = () => {
    let loading_screen          = get("loading-screen")
    let loading_bar_container   = get("slide_x")
    let loading_bar             = get("slide_y")
    let loading_message         = get("message")

    board = get("board")

    fade_out(loading_bar, fade_delay)
    fade_out(loading_message, fade_delay)
    fade_out(loading_screen, fade_delay, fade_delay)

    setTimeout(() => {
        loading_bar_container.remove()
        loading_bar.remove()
        loading_message.remove()
    }, fade_delay)

    setTimeout(() => {
        loading_screen.remove()
    }, fade_delay * 2)

    setTimeout(() => {
        physics_loop()
        render_loop()
    }, fade_delay)

    pause_screen                = get("pause-screen")
    text_box_container          = get("text-box-container")
    text_box                    = get("text-box")
    text_box_button             = get("text-box-button")
    help_panel                  = get("help-panel")
    help_panel_container        = get("help-panel-container")

    text_box_button.onclick     = () => toggle_help_panel()

    text_box.disabled           = true
    text_box_button.disabled    = true

    pause_button                = get("toggle-pause")
    info_button                 = get("toggle-info")
    button_container_background = get("button-container-background")

    pause_button.onclick        = () => toggle_pause()
    info_button.onclick         = () => toggle_info_panel()

    info_panel      = get("info-panel")
    health_counter  = get("health-counter")
    ammo_counter    = get("ammo-counter")
    class_counter   = get("class-counter")
    x_pos_counter   = get("x-pos-counter")
    y_pos_counter   = get("y-pos-counter")
    speed_counter   = get("speed-counter")
    angle_counter   = get("angle-counter")
    enemy_counter   = get("enemy-counter")
    element_counter = get("element-counter")
    tps_counter     = get("ticks-per-second-counter")
    fps_counter     = get("frames-per-second-counter")
    load_counter    = get("load-counter")

    movable_helper  = get("movable-helper")
    player          = new Movable(
        "player",
        0, 0,
        undefined, undefined, undefined, undefined, undefined, undefined,
        undefined, undefined, undefined,
        1.5
    )
}



function test_command(args) {
    for(i = args.length; i > 0; i--) {
        if(args[i] == "") {
            args.splice(i, 1)
        }
    }

    if(args[0] == "") { return "white" } // if text box is empty

    let arg_len = args.length
    let arg_count
    let are_args_bad

    function is_count_bad(count, allow_all = true) {
        if(count == null) { return false }
        return (!allow_all && count == "all") && isNaN(count)
    }

    function is_type_bad(type, allow_all = true) {
        if(type == null) { return false }
        return (type != "enemy" &&
                type != "dummy" &&
                type != "all") ||
                (!allow_all && type == "all")
    }

    function is_selection_bad(
        index,
        allow_self      = true,
        allow_all_count = true,
        allow_all_type  = true
    ) {
        let arg1 = args[index]
        let arg2 = args[index + 1]

        if( (allow_self && arg1 == "self" && arg2 == null) ||
            (allow_all_count && allow_all_type && arg1 == "all" && arg2 == null)
        ) {
            arg_count--
            return false
        }

        return  is_count_bad(args[index], allow_all_count) ||
                is_type_bad(args[index+1], allow_all_type)
    }

    switch(args[0]) {
        case "spawn":
            arg_count       = 3
            are_args_bad    = is_selection_bad(1, false, false, false)
            break

        case "remove":
            arg_count       = 3
            are_args_bad    = is_selection_bad(1, false, true, true)
            break

        case "kill":
        case "revive":
            arg_count       = 3
            are_args_bad    = is_selection_bad(1, true, true, true)
            break

        case "heal":
        case "harm":
            arg_count       = 4
            are_args_bad    = isNaN(args[1]) || is_selection_bad(2, true, true, true)
            break

        default: return "red"
    }

    if(are_args_bad)                { return "red" }
    else if(arg_len != arg_count)   { return "yellow" }
    else                            { return "green" }
}

function parse_command(args) {
    let end_ind         = movable_instances.length - 1
    let targeting_self  = false
    let targeting_all   = false
    let targeting_enemy = false
    let targeting_dummy = false
    let targeting_count
    let amount

    function _handle_count(str) {
        switch(str) {
            case "all":     targeting_count = end_ind; break
            case "self":    targeting_self  = true; break
            default:        targeting_count = parseInt(str)
        }
    }

    function _handle_type(str) {
        switch(str) {
            case "enemy":   targeting_enemy = true; break
            case "dummy":   targeting_dummy = true; break
            case "all":     targeting_all   = true; break
        }
    }

    function _handle_selection(index) {
        _handle_count(args[index])

        if(targeting_count == end_ind && args[index + 1] == null) {
            targeting_all = true
        } else {
            _handle_type(args[index+1])
        }

    }

    function _is_target(current) {
        return (
            (targeting_all && current != player) ||
            (targeting_enemy && current.element.id == "enemy") ||
            (targeting_dummy && current.element.id == "dummy")
        )
    }

    switch(args[0]) {
        case "spawn":
        case "remove":
        case "kill":
        case "revive":
            _handle_selection(1)
            break

        case "heal":
        case "harm":
            amount = parseInt(args[1])
            _handle_selection(2)
    }

    switch(args[0]) {
        case "spawn":
            if(targeting_enemy || targeting_dummy) {
                for(i = 0; i < targeting_count; i++) {
                    new Movable(args[2])
                }
            }
            break

        case "remove":
            for(i = 0; i < targeting_count && i <= end_ind; i++) {
                let current = movable_instances[i]

                if(_is_target(current)) {
                    movable_instances[i].element.remove()
                    movable_instances.splice(i, 1)
                    i--
                    targeting_count--
                    end_ind--
                } else {
                    targeting_count++
                }
            }
            break

        case "kill":
            if(targeting_self) {
                player.kill()
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(current.is_alive && _is_target(current)) {
                    current.kill()
                } else {
                    targeting_count++
                }
            }
            break


        case "revive":
            if(targeting_self) {
                player.revive()
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(_is_target(current)) {
                    current.revive()
                } else {
                    targeting_count
                }
            }
            break

        case "harm": amount = -amount
        case "heal":
            if(targeting_self) {
                let final_health = player.health + amount

                if(final_health < 0)                        { player.kill() }
                else if(final_health > player.max_health)   { player.revive() }
                else                                        { player.heal(amount) }
                break
            }

            for(i = end_ind; i > end_ind - targeting_count && i > 0; i--) {
                let current = movable_instances[i]

                if(current == player) { targeting_count++ }
                else {
                    let final_health = current.health + amount

                    if(final_health < 0)                        { current.kill() }
                    else if(final_health > current.max_health)  { current.revive() }
                    else                                        { current.heal(amount) }
                }
            }
            break
    }
}

function handle_key(k, start_move) {
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

onkeydown = (e) => {
    let k = e.key
    let is_k_pause_trigger = k == " " || k == "Enter"

    if(k == "Escape") {
        toggle_pause()
        return
    }

    if(is_paused) {
        if(text_box == document.activeElement) {
            text_box.blur()
            text_box.focus()

            if(is_k_pause_trigger && text_box.value == "") {
                toggle_pause()
                return
            }

            setTimeout(() => {
                let args = text_box.value.split(" ")

                if(text_box.value == "") {
                    text_box.className = ""
                    return
                }

                let command_score   = test_command(args)
                text_box.className  = command_score

                if(k == "Enter") {
                    if(command_score == "green") {
                        parse_command(args)
                        text_box.value      = ""
                        text_box.className  = ""
                    }
                }
            }, 10)

            return
        }
    } else {
        if(k == "i") { toggle_info_panel() }
    }

    handle_key(k, true)
}

onkeyup = (e) => { handle_key(e.key, false) }

ontouchstart = (e) => {
    e.preventDefault()

    if(is_paused) { return }

    last_swipe_x = e.touches[0].pageX
    last_swipe_y = e.touches[0].pageY
}

ontouchmove = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if(is_paused) { return }

    let new_swipe_x = e.touches[0].pageX
    let new_swipe_y = e.touches[0].pageY
    let diff_x      = new_swipe_x - last_swipe_x
    let diff_y      = new_swipe_y - last_swipe_y

    if( Math.abs(diff_x) < touch_threshold &&
        Math.abs(diff_y) < touch_threshold) { return }

    let angle = Math.atan2(diff_y, diff_x)

    player.move(
        clamp(
            Math.cos(angle) * Math.abs(diff_x) * touch_sensitivity,
            player.move_speed
        ),

        clamp(
            Math.sin(angle) * Math.abs(diff_y) * touch_sensitivity,
            player.move_speed
        )
    )

    last_swipe_x = new_swipe_x
    last_swipe_y = new_swipe_y
}



is_paused               = false
wave_is_spawning        = true
info_panel_is_hidden    = true
help_panel_is_hidden    = true
pause_screen_is_hidden  = true

fade_delay  = 200

move_up     = false
move_down   = false
move_left   = false
move_right  = false

enemy_spawn_cap             = 250
current_enemy_spawn_timer   = -200
enemy_spawn_delay           = 10

follow_distance     = 100
follow_ease         = 21

leave_distance      = 15
leave_ease          = create_odd_exponent(30, 2)

touch_sensitivity   = 0.3
touch_threshold     = 5

max_tps             = 60
game_tick           = 1000 / max_tps

decimal_limit       = 2

// always 0 on start
enemy_count                     = 0
start_render_time               = 0
time_of_last_tps_counter_update = 0
frames_drawn                    = 0
