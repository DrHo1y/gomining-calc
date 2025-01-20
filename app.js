const express = require('express')
const path = require('path')

const app = express()

const getData = require('./api')

app.use(express.json({ extended: true }))
app.use(express.urlencoded({ extended: true }))

app.get(
    '/',
    async (req, res) => {
        try {
            res.status(200).sendFile(path.join(__dirname, 'public/index.html'))
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)
app.get(
    '/index.js',
    async (req, res) => {
        try {
            res.status(200).sendFile(path.join(__dirname, 'public/index.js'))
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)

app.post(
    '/calc',
    async (req, res) => {
        try {
            const data = req.body
            var result = await getData(data.data)
            res.status(200).json(result)
        } catch (e) {
            res.status(500).json({ msg: e })
        }
    }
)


app.listen(3000, () => {
    console.log('server work on http://localhost:3000/')
})