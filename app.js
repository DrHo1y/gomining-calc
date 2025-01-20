const express = require('express')
const path = require('path')

const app = express()

const { getData } = require('./src/api')

app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

app.get(
    '/',
    async (req, res) => {
        try {
            var time = Date.now()
            res.status(200).sendFile(path.join(__dirname, 'public/index.html'))
            time = Date.now() - time
            console.log('get / -- ' + time/1000)
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)
app.get(
    '/index.js',
    async (req, res) => {
        try {
            var time = Date.now()
            res.status(200).sendFile(path.join(__dirname, 'public/index.js'))
            time = Date.now() - time
            console.log('get /index.js -- ' + time/1000)
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)

app.post(
    '/calc',
    async (req, res) => {
        try {
            var time = Date.now()
            const data = req.body
            var result = await getData(data.data)
            res.status(200).json(result)
            time = Date.now() - time
            console.log('post /calc -- ' + time/1000)
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)


app.listen(3000, () => {
    console.log('server work on http://localhost:3000/')
})