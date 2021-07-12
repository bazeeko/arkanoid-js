let playerBoard
let getscoreboard = false
async function addPlayer() {
    getscoreboard = true
    let player = {
        Name: document.getElementById("pname").value,
        Score: SCORE,
        Time: TIME
    }
    document.getElementById("pname").value = ''
    let url = 'http://localhost:8282/score'
    let init = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Accept": 'application/json'
        },
        'Access-Control-Allow-Origin': '*',
        body: JSON.stringify(player)
    }
    console.log(init)
    try {
        let response = await fetch(url, init)
        let res = await response.json()
        playerBoard = res
        createTable(res, player)
    } catch (e) {
        console.log(e)
    }
}

let allPages
let current = 1

function createTable(res, player) {
    let table = document.getElementById("table")
    document.getElementById("player").style.display = "none"
    document.getElementById("board").style.display = "block"
    let lenRes = res ? res.length : 1
    allPages = Math.ceil(lenRes / 5)
    document.getElementById("all").innerHTML = allPages
    document.getElementById("current").innerHTML = current

    if (!player) {
        document.getElementById("head").style.display = "none"
    } else {
        document.getElementById("plname").innerHTML = player.Name
        for (let i = 0; i < res.length; i++) {
            if (res[i].Name === player.Name) {
                const prc = Math.round((i + 1) / lenRes * 100)
                document.getElementById("percent").innerHTML = prc + '%'
                document.getElementById("rank").innerHTML = i + 1 + ''
            }
        }
    }
    for (let i = 0; i < 5; i++) {
        let tr = document.createElement("tr")
        let td = document.createElement("td")
        td.classList.add("tdata")
        td.innerHTML = i + 1
        tr.appendChild(td)
        if (res && res[i] !== undefined) {
            for (const val of Object.values(res[i])) {
                let td = document.createElement("td")
                td.classList.add("tdata1")
                td.innerHTML = val
                tr.appendChild(td)
            }
        } else {
            for (let j = 0; j < 3; j++) {
                let td = document.createElement("td")
                tr.appendChild(td)
            }
        }
        table.appendChild(tr)
    }
}
let five = 5
let pages

function next() {
    if (playerBoard.length >= 6) {
        if (allPages === current) return
        let tdata = document.querySelectorAll(".tdata")
        let j = 0
        for (let i = 0; i < 5; i++) {
            five++
            tdata[i].innerHTML = five
            if (playerBoard[five - 1] !== undefined) {
                for (const val of Object.values(playerBoard[five - 1])) {
                    let tdata1 = document.querySelectorAll(".tdata1")
                    tdata1[j].innerHTML = val
                    j++
                }
            } else {
                for (let k = j; k < 15; k++) {
                    let tdata1 = document.querySelectorAll(".tdata1")
                    tdata1[k].innerHTML = ''
                }
            }
        }
        current++
        document.getElementById("current").innerHTML = current
    }

    pages = five
}

function previous() {
    if (playerBoard.length >= 6) {
        if (current === 1) return
        let tdata = document.querySelectorAll(".tdata")
        let j = 0
        pages -= 10
        five -= 5
        for (let i = 0; i < 5; i++) {
            pages++
            tdata[i].innerHTML = pages
            if (playerBoard[pages - 1] !== undefined) {
                for (const val of Object.values(playerBoard[pages - 1])) {
                    let tdata1 = document.querySelectorAll(".tdata1")
                    tdata1[j].innerHTML = val
                    j++
                }
            } else {
                for (let k = j; k < 15; k++) {
                    let tdata1 = document.querySelectorAll(".tdata1")
                    tdata1[k].innerHTML = ''
                }
            }

        }
        current--
        document.getElementById("current").innerHTML = current
    }
}