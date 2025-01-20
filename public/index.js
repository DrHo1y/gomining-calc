function removeChild(id) {
    var tag = document.getElementById(id)
    var child = tag.childNodes
    for (let i = child.length - 1; i >= 0; i--) {
        tag.removeChild(child[i])
    }
}
function appendChild(obj) {
    var root = document.getElementById(obj[0])
    var tag = document.createElement(obj[1])
    tag.className = obj[2]
    tag.innerText = obj[3]
    if (obj[4]) {
        tag.id = obj[4]
    }
    root.append(tag)
}
function remove() {
    var rub = document.getElementById('rub')
    var btc = document.getElementById('btc')
    var upgrade = document.getElementById('upgrade')
    rub.style = 'display: none;'
    btc.style = 'display: none;'
    upgrade.style = 'display: none;'
    var table = document.getElementById('tableReward')
    table.style = 'display: none;'

    removeChild('rub')
    removeChild('btc')
    removeChild('upgrade')
    removeChild('hour')
    removeChild('day')
    removeChild('week')
    removeChild('month')
    removeChild('year')
}
function* idForm() {
    var index = 1;
    while (index <= 10) yield index++
}
const gen = idForm()
function addMinerForm() {
    const root = document.getElementById('form')
    const index = gen.next().value
    const pow = 'pow-' + String(index)
    const newPow = 'newPow-' + String(index)
    const eff = 'eff-' + String(index)
    const newEff = 'newEff-' + String(index)
    const row = document.createElement('div')
    row.className = 'row align-items-start'
    row.style = 'padding-top: 50px;'
    row.innerHTML = `
    <div class="col-3">
        <div class="mb-3">
            <label for="pow" class="form-label">Текущая производительность TH</label>
            <input type="number" class="form-control" id="${pow}" value="2">
        </div>
    </div>
    <div class="col-3">
        <div class="mb-3">
            <label for="newPow" class="form-label">Желаемая производительность TH</label>
            <input type="number" class="form-control" id="${newPow}" value="2000">
        </div>
    </div>
    <div class="col-3">
        <div class="mb-3">
            <label for="eff" class="form-label">Текущая энергоэффективность W/TH</label>
            <input type="number" class="form-control" id="${eff}" value="20">
        </div>
    </div>
    <div class="col-3">
        <div class="mb-3">
            <label for="newEff" class="form-label">Желаемая энергоэффективность W/TH</label>
            <input type="number" class="form-control" id="${newEff}" value="20">
        </div>
    </div>
    `
    root.append(row)
    console.log(pow)

}
async function getData() {
    remove()
    appendChild([
        'load',
        'div',
        'spinner-border',
        ''
    ])
    var table = document.getElementById('tableReward')
    var rub = document.getElementById('rub')
    var btc = document.getElementById('btc')
    var upgrade = document.getElementById('upgrade')
    const data = []
    const elems = ['pow', 'newPow', 'eff', 'newEff']
    var flag = true
    var num = 0
    while (flag)  {
        var check = document.getElementById(elems[0] + `-${num}`)
        if (!check) {
            flag = false
            break
        }
        const calc = {
            pow: 0,
            newPow: 0,
            eff: 0,
            newEff: 0
        }
        for (let i = 0; i < elems.length; i++) {
            const el = document.getElementById(elems[i] +  `-${num}`)
            calc[elems[i]] = el.value
        }
        data.push(calc)
        num += 1
    } 
    // let pow = document.getElementById('pow-0').value
    // let newPow = document.getElementById('newPow-0').value
    // let eff = document.getElementById('eff-0').value
    // let newEff = document.getElementById('newEff-0').value
    let url = `/calc`
    var req = await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            data: data
        })
    })
    var res = await req.json()
    document.getElementById('load').removeChild(document.getElementById('load').lastChild)
    table.style = ''
    rub.style = ''
    btc.style = ''
    upgrade.style = ''
    appendChild([
        'rub',
        'div',
        'card-body',
        'Обменный курс USDT = ' + res['rubusd']
    ])
    appendChild([
        'btc',
        'div',
        'card-body',
        'Курс биткоина = ' + res['BTCprice']
    ])
    appendChild([
        'upgrade',
        'div',
        'card-body',
        'Стоимость апгрейда = ' + res['calc']['costUpgrade']
    ])

    let mas = ['hour', 'day', 'week', 'month', 'year']
    let mas1 = ['Час', 'День', 'Неделя', 'Месяц', 'Год']
    let mas2 = ['rewardBTC', 'reward', 'service', 'serviceDisc', 'profit', 'profitDisc']

    for (let i = 0; i < mas.length; i++) {
        appendChild([mas[i], 'th', '', mas1[i]])
        for (let j = 0; j < mas2.length; j++) {
            appendChild([mas[i], 'th', '', res['reward'][mas[i]][mas2[j]]])
        }
    }
}
