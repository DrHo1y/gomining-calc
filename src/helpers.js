function round(num) {
    return +num.toFixed(2)
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

module.exports = { round, format, toNum }
