const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const port = process.env.PORT || 3000

app = express()

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('public'))

app.get('/',(req,res)=>{
  fs.createReadStream('public/home.html').pipe(res)
})

app.listen(port,()=>{
  console.log(`Listening on port ${port}`)
})