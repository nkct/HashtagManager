window.onload = function() {
    localizeHtmlPage()
    load_list()

    new_set = document.getElementById("new_btn")
    new_set.addEventListener("click", function () {
        open_edit_menu("")
    })

    close_edit_btn = document.getElementById("close_edit_btn")
    close_edit_btn.addEventListener("click", close_edit)

    hashtags = document.getElementById("hashtags")
    get_settings(function(settings) {
        if (settings.typ_sup_toggle) {
            hashtags.addEventListener("input", typing_support)
        }
    })

    search_bar = document.getElementById("search_bar")
    search_bar.addEventListener("input", filter_list)

    new_set = document.getElementById("settings_btn")
    new_set.addEventListener("click", function () {
        open_settings()
    })

    typ_sup_toggle = document.getElementById("typ_sup_toggle")
    typ_sup_toggle.addEventListener("change", function() {
        value = typ_sup_toggle.childNodes[1].checked
        get_settings(function(settings) {
            settings.typ_sup_toggle = value

            hashtags = document.getElementById("hashtags")
            if ( value ) {
                hashtags.addEventListener("input", typing_support)
            } else {
                hashtags.removeEventListener("input", typing_support)
            }

            set_settings(settings)
        })
    })

    save_close_toggle = document.getElementById("save_close_toggle")
    save_close_toggle.addEventListener("change", function() {
        value = save_close_toggle.childNodes[1].checked
        get_settings(function(settings) {
            settings.save_close_toggle = value

            set_settings(settings)
        })
    })

    close_settings_btn = document.getElementById("close_settings_btn")
    close_settings_btn.addEventListener("click", function() {
        main_menu = document.getElementById("main")
        edit_menu = document.getElementById("edit")
        settings_menu = document.getElementById("settings")
        
        settings_menu.style.display = "none"
        edit_menu.style.display = "none"

        main_menu.style.display = "block"

        load_list()
    })

    clear_btn = document.getElementById("clear_btn")
    clear_btn.addEventListener("click", function() {
        chrome.storage.local.clear()
    })

    reset_settings_btn = document.getElementById("reset_settings_btn")
    reset_settings_btn.addEventListener("click", function() {
        custom_confirm("Reset your settings?", "lightcoral", "black", function(confirm) { 
            if (confirm) {
                set_keybinds({
                    save: "Enter",
                    back: "Escape",
                    new: "Control+n",
                    edit: "Control+e",
                    delete: "Control+d",
                    favorite: "Control+f"
                })
                set_settings({
                    save_close_toggle: true,
                    typ_sup_toggle: true
                })
                typ_sup_toggle = document.getElementById("typ_sup_toggle")
                typ_sup_toggle.childNodes[1].checked = true
                
                save_close_toggle = document.getElementById("save_close_toggle")
                save_close_toggle.childNodes[1].checked = true
            }
        })
        
    })

    delete_sets_btn = document.getElementById("delete_sets_btn")
    delete_sets_btn.addEventListener("click", function() {
        custom_confirm("Delete all your sets?", "lightcoral", "black", function(confirm) { 
            if (confirm) {
                set_favorites({})
                set_sets({})
            }
        })
        
    })

    timeout_id = 0

    key_map = {}
    keys_ordered = []
    global_keybinds = {}
    document.addEventListener("keydown", shortcuts)
    document.addEventListener("keyup", shortcuts)

    async_get_keybinds().then(function(keybinds) {
        global_keybinds = keybinds
    })


    keybinds_btn = document.getElementById("keybinds_btn")
    keybinds_btn.addEventListener("click", function() {
        keybinds_menu = document.getElementById("keybinds")
        settings_menu = document.getElementById("settings")
        
        keybinds_menu.style.display = "block"

        settings_menu.style.display = "none"

        async_get_keybinds().then(function(keybinds) {
            global_keybinds = keybinds
    
            document.getElementById("save_keybind").value = keybinds.save
            document.getElementById("back_keybind").value = keybinds.back
            document.getElementById("new_keybind").value = keybinds.new
            document.getElementById("edit_keybind").value = keybinds.edit
            document.getElementById("delete_keybind").value = keybinds.delete
            document.getElementById("favorite_keybind").value = keybinds.favorite
        })
    })

    close_keybinds_btn = document.getElementById("close_keybinds_btn")
    close_keybinds_btn.addEventListener("click", function() {
        keybinds_menu = document.getElementById("keybinds")
        settings_menu = document.getElementById("settings")
        
        keybinds_menu.style.display = "none"

        settings_menu.style.display = "block"
    })
    
    document.querySelectorAll(".keybind").forEach((keybind_label) => {
        keybind_label.childNodes[3].addEventListener("focus", (e) => {
            e.target.value = ""
            e.target.placeholder = "Press any key"
        })
        keybind_label.addEventListener("keydown", change_keybind)
        keybind_label.childNodes[3].addEventListener("blur", (e) => {
            async_get_keybinds().then(function(keybinds) {
                keybinds[e.target.id.replace("_keybind", "")] = e.target.value

                set_keybinds(keybinds)
            })
        })
    })

    document.getElementById("export_btn").addEventListener("click", function(e) {
        get_sets(function(sets) {
            a = document.createElement("a")
            file = new Blob([JSON.stringify(sets, null, 4)], {type: "text/plain"})
            a.href = URL.createObjectURL(file);
            a.download = "sets.json";
            a.click();
        })
    })
}

function localizeHtmlPage()
{
    //Localize by replacing __MSG_***__ meta tags
    var objects = document.getElementsByTagName('html');
    for (var j = 0; j < objects.length; j++)
    {
        var obj = objects[j];

        var valStrH = obj.innerHTML.toString();
        var valNewH = valStrH.replace(/__MSG_(\w+)__/g, function(match, v1)
        {
            return v1 ? chrome.i18n.getMessage(v1) : "";
        });

        if(valNewH != valStrH)
        {
            obj.innerHTML = valNewH;
        }
    }
}

function open_alert() {
    if (document.body.querySelector("#alert") !== null) {
        alert_box = document.body.querySelector("#alert")
        close_alert(alert_box, function() {
            open_alert()
        })

    }

    alert_box = document.createElement("div")
    alert_box.id = "alert"
    alert_box.tabIndex = 9999
    document.body.appendChild(alert_box)


    alert_close = document.createElement("span")
    alert_close.id = "alert_close"
    alert_close.innerHTML = "&times;"
    alert_close.addEventListener("click", function(e) {
        close_alert(alert_box)
    })

    alert_box.appendChild(alert_close)

    return alert_box

}

function close_alert(alert_box, callback = null) {
    alert_box.style.visibility = "hidden"
    alert_box.style.opacity = 0

    alert_box.addEventListener("transitionend", function(e) {
        if (alert_box.parentNode == document.body) {
            document.body.removeChild(alert_box)

            if (callback !== null) {
                callback()
            }
        }
    })

}

function custom_alert(message, bg_color, color) {
    alert_box = open_alert()
    alert_box.style.background = bg_color
    alert_box.style.color = color

    span = document.createElement("span")
    span.innerHTML = message
    alert_box.appendChild(span)

    alert_box.style.visibility = "visible"
    alert_box.style.opacity = 1

    alert_box.focus()
    alert_box.addEventListener("focusout", function(e) {
        close_alert(alert_box)
    })
}

function custom_confirm(message, bg_color, color, callback) {
    alert_box = open_alert()
    alert_box.style.background = bg_color
    alert_box.style.color = color
    
    span = document.createElement("span")
    span.style.display = "block"
    span.innerHTML = message
    alert_box.appendChild(span)

    yes = document.createElement("button")
    yes.innerHTML = chrome.i18n.getMessage("confirm")
    yes.addEventListener("click", function(e) {
        close_alert(alert_box)
        
        callback(true)

        return
    })
    alert_box.appendChild(yes)
    
    no = document.createElement("button")
    no.innerHTML = chrome.i18n.getMessage("decline")
    no.addEventListener("click", function(e) {
        close_alert(alert_box)
        
        callback(false)
        
        return
    })
    alert_box.appendChild(no)

    alert_box.style.visibility = "visible"
    alert_box.style.opacity = 1


    alert_box.focus()
    alert_box.addEventListener("focusout", function(e) {
        close_alert(alert_box)
    })
}

function change_keybind(e) {
    e.preventDefault()
    bind = e.key
    if (e.target.value != "") {
        bind = e.target.value + "+" + bind
    }
    e.target.value = bind
}

function get_sets(callback) {
    chrome.storage.local.get(["sets"], function(result) {
        sets = result.sets
        if (Object.keys(result).length == 0) {
            sets = {}
            set_sets(sets)
        }
        callback(sets)
    })
}
function get_settings(callback) {
    chrome.storage.local.get(["settings"], function(result) {
        settings = result.settings
        if (Object.keys(result).length == 0) {
            settings = {
                save_close_toggle: true,
                typ_sup_toggle: true
            }
            set_settings(settings)
        }
        callback(settings)
    })
}

function get_favorites(callback) {
    chrome.storage.local.get(["favorites"], function(result) {
        favorites = result.favorites
        if (Object.keys(result).length == 0) {
            favorites = {}
            set_sets(favorites)
        }
        callback(favorites)
    })
}

function async_get_keybinds() {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get(["keybinds"], function(result) {
        keybinds = result.keybinds
        if (Object.keys(result).length == 0) {
            keybinds = {
                save: "Enter",
                back: "Escape",
                new: "Control+n",
                edit: "Control+e",
                delete: "Control+d",
                favorite: "Control+f"
            }
            set_keybinds(keybinds)
        }
        resolve(keybinds)
        })
    })
    
}

function set_sets(sets) {
    chrome.storage.local.set({ sets })
}
function set_settings(settings) {
    chrome.storage.local.set({ settings })
}
function set_favorites(favorites) {
    chrome.storage.local.set({ favorites })
}
function set_keybinds(keybinds) {
    chrome.storage.local.set({ keybinds })

    global_keybinds = keybinds
}

function load_list() {
    get_sets(function(sets) {

        set_list = document.getElementById("set_list")
        set_list.innerHTML = ""

        if (Object.keys(sets).length == 0) {
            set_list.innerHTML = chrome.i18n.getMessage("no_sets_message")
            return
        }

        get_favorites(function(favorites) {
            sets = Object.fromEntries(
                Object.entries(sets).sort(function(x, y) {
                    if (typeof favorites[y[0]] == "undefined") {
                        favorites[y[0]] = 0
                    }
                    if (typeof favorites[x[0]] == "undefined") {
                        favorites[x[0]] = 0
                    }
                    return favorites[y[0]] - favorites[x[0]]
                })
            )


            Object.keys(sets).forEach(set => {
                item = document.createElement("li")
                item.addEventListener("click", function() {
                    type = "text/plain";
                    blob = new Blob([sets[set]], { type });
                    data = [new ClipboardItem({ [type]: blob })];
                    navigator.clipboard.write(data)

                    custom_alert(chrome.i18n.getMessage("copy_alert"), "lightgray", "black")
                })

                set_name = document.createElement("h2")
                set_name.appendChild(document.createTextNode(set))

                set_content = document.createElement("span")
                set_content.classList.add("set_content")
                set_content.appendChild(document.createTextNode(sets[set]))

                set_delete = document.createElement("button")
                set_delete.classList.add("delete_btn")
                set_delete.classList.add("icon_btn")
                set_delete.classList.add("list_icon_btn")
                delete_img = document.createElement("img")
                delete_img.src = "icons/icons8-delete-trash-48.png"
                set_delete.appendChild(delete_img)
                set_delete.addEventListener("click", function(e) {
                    e.stopPropagation()

                    custom_confirm(chrome.i18n.getMessage("delete_confirm"), "lightcoral", "black", function(confirm) {
                        if (confirm) {
                            get_sets(function(sets) {
                                delete sets[set]
                                set_sets(sets)

                                get_favorites(function(favorites) {
                                    delete favorites[set]
                                    set_favorites(favorites)
                                })

                                load_list()
                            })

                            custom_alert(chrome.i18n.getMessage("delete_alert"), "lightcoral", "black")
                        }
                    })
                })
                set_delete.title = chrome.i18n.getMessage("set_delete_title", set)

                set_edit = document.createElement("button")
                set_edit.classList.add("edit_btn")
                set_edit.classList.add("icon_btn")
                set_edit.classList.add("list_icon_btn")
                edit_img = document.createElement("img")
                edit_img.src = "icons/icons8-pencil-48.png"
                set_edit.appendChild(edit_img)
                set_edit.addEventListener("click", function (e) {
                    e.stopPropagation()

                    open_edit_menu(set)
                })
                set_edit.title = chrome.i18n.getMessage("set_edit_title", set)

                item.appendChild(set_name)
                item.appendChild(set_content)
                item.appendChild(set_delete)
                item.appendChild(set_edit)

                item.classList.add("set_list_elem")


                set_list.appendChild(item)

                index_in_parent = Array.prototype.indexOf.call(item.parentNode.childNodes, item)
                index_offset = index_in_parent * 2 + 1

                item.tabIndex = index_in_parent + 1 + index_offset
                set_delete.tabIndex = index_in_parent + 2 + index_offset
                set_edit.tabIndex = index_in_parent + 3 + index_offset

                if (favorites[set]) {
                    set_list.childNodes.forEach(item => {
                        if (item.childNodes[0].innerHTML == set) {
                            item.classList.add("favourited")
                        }
                    })
                }

            })
        })
    })
}

function open_edit_menu(set) {
    settings_menu = document.getElementById("settings")
    main_menu = document.getElementById("main")
    edit_menu = document.getElementById("edit")
    
    settings_menu.style.display = "none"
    main_menu.style.display = "none"
    edit_menu.style.display = "block"

    set_name = document.getElementById("set_name")
    set_name.value = set
    set_name.focus()

    hashtags = document.getElementById("hashtags")
    get_sets(function(sets) {
        if (typeof(sets[set]) !== "undefined") {
            hashtags.value = sets[set]
        } else {
            hashtags.value = ""
        }
    })

    save_btn = document.getElementById("save_btn")
    save_btn.addEventListener("click", function() {
        save(set_name.value, hashtags)

        custom_alert(chrome.i18n.getMessage("save_alert"), "lightgreen", "black")
    })

    favorite_toggle = document.getElementById("favorite_toggle")
    get_favorites(function(favorites) {
        favorite_toggle.checked = favorites[set]
    })
    favorite_toggle.addEventListener("change", function() {
        get_favorites(function(favorites) {

            favorites["fav_current_set"] = favorite_toggle.checked

            set_favorites(favorites)
        })
    })
}

function close_edit() {
    main_menu = document.getElementById("main")
    edit_menu = document.getElementById("edit")

    save_btn = document.getElementById("save_btn")
    save_btn.replaceWith(save_btn.cloneNode(true))
                
    edit_menu.style.display = "none"
    main_menu.style.display = "block"

    load_list()
}

function save(set_name, hashtags) {
    get_sets(function(sets) {
        sanitize_tags(hashtags)

        sets[set_name] = hashtags.value.split(",")

        set_sets(sets)
    })
    get_favorites(function(favorites) {
        favorites[set_name] = favorites["fav_current_set"]

        set_favorites(favorites)
    })
    get_settings(function(settings) {
        if (settings.save_close_toggle) {
            close_edit()
        }
    })
}

function sanitize_tags(hashtags) {
    tags = hashtags.value.split(" ")
    tags = [...new Set(tags)]

    tags.forEach(tag => {
        if (tag.charAt(0) != "#" || tag.charAt(tag.length - 1) != "," && tag != tags[tags.length - 1] || tag == "#," || tag == "#") {
            tags.splice(tags.indexOf(tag), 1)
        }
    })

    hashtags.value = tags.join(" ")

    if (tags[tags.length - 1] == "") {
        hashtags.value = hashtags.value.substring(0, hashtags.value.length - 1)
    }
    if (hashtags.value.charAt(hashtags.value.length - 1) == ",") {
        hashtags.value = hashtags.value.substring(0, hashtags.value.length - 1)
    }
}

function typing_support(e) {   
    if (e.data == " ") {
        tags = e.target.value.split(" ")
        last = tags[tags.length - 2]

        if ( last.charAt(0) != "#" ) {
            last = "#" + last
        }
        if ( last.charAt(last.length - 1) != ",") {
            last = last + ","
        }
        tags[tags.length - 2] = last

        e.target.value = tags.join(" ")
    }
}

function filter_list(e) {
    set_list = document.getElementById("set_list")
    if (set_list.firstChild.nodeName != "LI") {
        return
    }
    set_list.childNodes.forEach(set => {
        filter = e.target.value
        set_name = set.childNodes[0].innerHTML
        if ( !(set_name.includes(filter)) ) {
            set.style.display = "none"
        } else {
            set.style.display = "block"
        }
    })
}

function open_settings() {
    main_menu = document.getElementById("main")
    main_menu.style.display = "none"

    edit_menu = document.getElementById("settings")
    edit_menu.style.display = "block"

    get_settings(function(settings) {
        typ_sup_toggle = document.getElementById("typ_sup_toggle")
        typ_sup_toggle.childNodes[1].checked = settings["typ_sup_toggle"]
        
        save_close_toggle = document.getElementById("save_close_toggle")
        save_close_toggle.childNodes[1].checked = settings["save_close_toggle"]
    })
}

function shortcuts(e) {
    key_map[e.key] = e.type == "keydown"
    
    if (keys_ordered.includes(e.key)) {
        keys_ordered.splice(keys_ordered.indexOf(e.key), 1)
    }
    keys_ordered.push(e.key)

    current_keys = Object.entries(key_map).map(
        function ([key, value]) {
            if (value) {
                return key
            }
        }
    ).filter(Boolean)

    ordered_current_keys = keys_ordered.filter(key => current_keys.includes(key))
    
    is_any_number_pressed = current_keys.some(function(key) {
        return isFinite(key)
    })

    if (is_any_number_pressed) {
        if (key_map["Control"]) {
            e.preventDefault()
            key_sum = ordered_current_keys.filter(Number).join("")
            set_list = document.getElementById("set_list")
            if (!!set_list.childNodes[key_sum - 1]) {
                set_list.childNodes[key_sum - 1].focus()
            }
        }
    }
    if (global_keybinds.save.toString().split("+").every((key) => key_map[key])) {
        if (document.getElementById("edit").style.display == "block") {
            e.preventDefault()
        }
        document.getElementById("save_btn").click()
    }
    if (global_keybinds.back.toString().split("+").every((key) => key_map[key])) {
        if (document.getElementById("main").style.display == "none") {
            e.preventDefault()
        }
        document.querySelectorAll(".close_btn").forEach(btn => {
            if (btn.parentNode.style.display == "block") {
                btn.click()
            }
        })
    }
    if (global_keybinds.favorite.toString().split("+").every((key) => key_map[key])) {
        e.preventDefault()
        document.getElementById("favorite_toggle").click()
    }
    if (global_keybinds.new.toString().split("+").every((key) => key_map[key])) {
        e.preventDefault()
        document.getElementById("new_btn").click()
    }
    if (global_keybinds.edit.toString().split("+").every((key) => key_map[key])) {
        if (document.activeElement.classList.contains("set_list_elem")) {
            e.preventDefault()
            document.activeElement.childNodes[3].click()
        }
    }
    if (global_keybinds.delete.toString().split("+").every((key) => key_map[key])) {
        if (document.activeElement.classList.contains("set_list_elem")) {
            e.preventDefault()
            document.activeElement.childNodes[2].click()
        }
    }
}