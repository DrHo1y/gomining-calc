function round(num) {
    return +num.toFixed(2)
}
function roundLong(num) {
    return +num.toFixed(8)
}
function format(num) {
    var frmt = new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "RUB",
        minimumFractionDigits: 2
    })
    return frmt.format(num)
}

function toNum(str) {
    var res = str.replace(',', '')
    return Number(res)
}

function strToNum(str) 
{
    return Number(str.replaceAll(/\s/g, '').replace('₽', '').replace(',', '.'))
}

module.exports = { round, format, toNum, strToNum, roundLong }
