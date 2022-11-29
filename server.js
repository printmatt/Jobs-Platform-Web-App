const express = require('express')

const app = express()

let count = 0

app.get('/',(req,res) => {
    count++
    res.send(`Hello World! Total number of visitors today: ${count}`)
})

app.listen(5000, () => console.log("Server is running on port 5000"))