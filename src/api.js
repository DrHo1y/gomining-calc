const axios = require('axios')
const jsdom = require('jsdom')
const NodeCache = require('node-cache')
const { round, format, toNum, strToNum, roundLong } = require('./helpers')
const cache = new NodeCache()

function setEffectPrice() {
    var effect = []
    effect[0] = {
        inx: 1,
        start: 50,
        end: 35,
        cost: 0.27
    }
    effect[1] = {
        inx: 2,
        start: 35,
        end: 28,
        cost: 0.99
    }
    effect[2] = {
        inx: 3,
        start: 28,
        end: 20,
        cost: 1
    }
    effect[3] = {
        inx: 4,
        start: 20,
        end: 15,
        cost: 2.04
    }
    return effect
}
function setPowerCost() {
    var powerCost = []
    var powers = 19
    var inx = 0
    var cost = [
        21.26,
        21.07,
        20.89,
        20.71,
        20.53,
        20.35,
        20.35,
        20.18,
        20.00,
        19.83,
        19.66,
        19.49,
        19.32,
        19.15,
        18.99,
        18.82,
        18.66,
        18.50,
        18.34,
        18.18
    ]
    var pow = [
        0,
        2,
        4,
        8,
        16,
        32,
        48,
        64,
        96,
        128,
        192,
        256,
        384,
        512,
        768,
        1024,
        1536,
        2560,
        3584,
        5001
    ]

    for (let power = 1; power <= powers; power++) {
        powerCost.push({
            inx: power,
            start: pow[inx],
            end: pow[inx + 1] - 1,
            cost: cost[power - 1]
        })
        inx++
    }
    return powerCost
}
async function getBtcPrice() {
    try {
        if (cache.has('btc-cost')) {
            const cacheData = cache.get(`btc-cost`)
            return cacheData
        }
        const btc = await axios({
            method: 'get',
            url: 'https://www.coinwarz.com/mining/bitcoin/calculator',
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Priority': 'u=0,i'
            }
        })
        const dom1 = new jsdom.JSDOM(btc.data)
        const btcCost = dom1.window.document.querySelector('#coin-menu > div > div.asset-container > div.col2 > div > div.asset-price > span.price-amt').textContent.trim().replace('$', '')
        cache.set('btc-cost', btcCost, 120)
        return btcCost
    } catch (e) {
        return null
    }
}
async function getUSDTRub() {
    try {
        if (cache.has('usdt-cost')) {
            const cacheData = cache.get(`usdt-cost`)
            return cacheData
        }
        const req = await axios({
            method: 'get',
            url: 'https://www.bybit.com/en/convert/usdt-to-rub/',
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Priority': 'u=0,i'
            }
        })
        const dom1 = new jsdom.JSDOM(req.data)
        const res = dom1.window.document
            .querySelector('#__next > div > main > div.layout > div.layout-children > div:nth-child(1) > div.ant-col.ant-col-24.ant-col-md-16 > div.ant-card.card-info.border-radius-4 > div > h2 > div.card-info-price.green')
            .textContent
            .trim()
            .replace('₽', '')
        cache.set('usdt-cost', Number(res) + 2.2, 120)
        return Number(res) + 2.2
    } catch (e) {
        return 105
    }
}



async function getThReward(pow, eff, cost, usdcurs, num, quan) {
    try {
        if (cache.has(`req-${num}`)) {
            const cacheData = cache.get(`req-${num}`)
            if (cacheData.pow == pow && cacheData.eff == eff && cacheData.quan == quan) {
                return cacheData.payload
            }
        }

        const btcCost = await getBtcPrice()

        const result = await axios({
            method: 'get',
            url: 'https://www.coinwarz.com/mining/bitcoin/calculator',
            headers: {
                Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Priority': 'u=0,i'
            },
            params: {
                h: pow,
                p: pow * eff,
                pc: cost,
                pf: 0.00,
                d: 110451907374650.00000000,
                r: 3.12500000,
                er: 1,
                btcer: btcCost,
                ha: 'TH',
                hc: 13699.00,
                hs: 0,
                hq: 0
            }
        })
        
        const dom = new jsdom.JSDOM(result.data)
        const table = dom.window.document.querySelector('body > div.container > main > section > section:nth-child(10) > div > table')
        const value = table.textContent.trim().replace(/\s+/g, ' ')
        const valueArr = value.split(' ')
        const arr = []
        for (let i = 0; i < valueArr.length; i++) {
            if (valueArr[i] == 'Hourly' || valueArr[i] == 'Daily' || valueArr[i] == 'Weekly' || valueArr[i] == 'Monthly' || valueArr[i] == 'Annually') {
                arr.push({
                    rewardBTC: toNum(valueArr[i + 1].replace('$', '')) * quan,
                    reward: toNum(valueArr[i + 2].replace('$', '')) * usdcurs * quan,
                    service: toNum(valueArr[i + 3].replace('$', '')) * usdcurs * quan,
                    //poolFees: toNum(valueArr[i+4].replace('$', '')) * usdcurs,
                    profit: toNum(valueArr[i + 5].replace('$', '')) * usdcurs * quan
                })
            }
        }

        const data = {
            pow,
            eff,
            quan,
            cost,
            usdcurs,
            payload: arr
        }
        cache.set(`req-${num}`, data, 120)
        return arr
    } catch (e) {
        console.log(e)
        return null
    }
}

function getThReward2() {
    // res = 3.125 * (86400 / (113757508810854 * (Math.pow(2,32) / (150 * 1000000000000))))
    const data = [
        {
            Hourly: {
                rewardBTC: '',

            }
        }
    ]
}

function caclUpgrade(obj, usdcurs) {
    const power = setPowerCost()
    const effect = setEffectPrice()
    const res = []
    for (let i = 0; i < obj.length; i++) {
        var fullcost = 0
        power.forEach(elem => {
            if (elem.start <= obj[i].pow && elem.end >= obj[i].pow) { 
                fullcost += (elem.end - obj[i].pow) * elem.cost
            }
            if (elem.start <= obj[i].newPow && elem.end <= obj[i].newPow && elem.start > obj[i].pow) { 
                fullcost += (elem.end - elem.start + 1) * elem.cost
            }
            if (elem.start <= obj[i].newPow && elem.end > obj[i].newPow) { 
                fullcost += (obj[i].newPow - elem.start + 1) * elem.cost
            }
        })
        effect.forEach(elem => {
            if (elem.start >= obj[i].newEff && elem.end < obj[i].eff && obj[i].eff > obj[i].newEff) {
                fullcost += obj[i].newPow * elem.cost * (elem.start - elem.end)
            }
        })
        fullcost = round(fullcost * usdcurs)
        res.push({
            currPow: obj[i].pow,
            newPow: obj[i].newPow,
            curEff: obj[i].eff,
            newEff: obj[i].newEff,
            costUpgrade: fullcost * obj[i].quan
        })
    }
    const sum = {
        currPow: 0,
        newPow: 0,
        curEff: 0,
        newEff: 0,
        costUpgrade: 0
    }

    for (let i = 0; i < res.length; i++) {
        for(el in sum) {
            sum[el] += res[i][el]
        }
    }
    for(el in sum) {
        if (el == 'costUpgrade') {
            sum['costUpgrade'] = format(sum['costUpgrade'])
        } else {
            sum[el] = Number(sum[el])
        }
    }
    return sum
}
async function calcReward(obj, usdcurs) {
    var costKiloWattHours = 31.87 / (1024 * 20 * 24) * 1000
    var costKiloWattHoursDisc = 25.13 / (1024 * 20 * 24) * 1000
    const objmas = ['hour', 'day', 'week', 'month', 'year']
    const resMas = []
    for (let i = 0; i < obj.length; i++) {
        const reward1 = await getThReward(obj[i].newPow, obj[i].newEff, costKiloWattHours, usdcurs, 1, obj[i].quan)
        const reward2 = await getThReward(obj[i].newPow, obj[i].newEff, costKiloWattHoursDisc, usdcurs, 2, obj[i].quan)
        const res = {
            hour: {},
            day: {},
            week: {},
            month: {},
            year: {}
        }
        for (let i = 0; i < objmas.length; i++) {
            for (elem in reward1[i]) {
                if (elem == 'rewardBTC') {
                    res[objmas[i]][elem] = reward1[i][elem]
                } else if (elem == 'profit') {
                    res[objmas[i]][elem] = reward1[i]['reward'] - reward1[i]['service']
                } else {
                    res[objmas[i]][elem] = reward1[i][elem]
                }
            }
            res[objmas[i]]['serviceDisc'] = reward2[i]['service']
            res[objmas[i]]['profitDisc'] = reward2[i]['reward'] - reward2[i]['service']
        }
        resMas.push(res)
        
    }

    const sum = {
        hour: {},
        day: {},
        week: {},
        month: {},
        year: {}
    }
    for (let i = 0; i < resMas.length; i++) {
        for(let j = 0; j < objmas.length; j++) {
            for (elem in resMas[i][objmas[j]]) {
                sum[objmas[j]][elem] = 0
            }
        }
    }
    for (let i = 0; i < resMas.length; i++) {
        for(let j = 0; j < objmas.length; j++) {
            for (elem in resMas[i][objmas[j]]) {
                sum[objmas[j]][elem] += resMas[i][objmas[j]][elem]
            }
        }
    }
    for (let i = 0; i < objmas.length; i++) {
        for(elem in sum[objmas[i]]) {
            if (elem == "rewardBTC") {
                sum[objmas[i]][elem] = String(sum[objmas[i]][elem])
            } else {
                sum[objmas[i]][elem] = format(sum[objmas[i]][elem])
            }
        }
    }
    return sum
}
async function getData(obj) {
    try {
        const usdcurs = 86.2 //await getUSDTRub()
        const btcCost = await getBtcPrice()
        const calc = caclUpgrade(obj, usdcurs)
        const reward = await calcReward(obj, usdcurs)
        var cost = strToNum(calc['costUpgrade'])
        var percent1 = strToNum(reward['year']['profit'])
        var percent2 = strToNum(reward['year']['profitDisc'])
        percent1 = round(percent1 / cost * 100)
        percent2 = round(percent2 / cost * 100)
        return {
            rubusd: format(usdcurs),
            BTCprice: format(toNum(btcCost) * usdcurs),
            calc,
            roi: {
                percent1,
                percent2
            },
            reward
        }
    } catch (e) {
        console.log(e)
        return null
    }
}

module.exports = { getData }