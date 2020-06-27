const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const port = process.env.PORT || 3000
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')
const fetch = require('node-fetch')
const cookieParser = require('cookie-parser')

dbURL = `https://jsonbox.io/box_39b5164cf9a2115ac071`

app = express()

app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.use(express.static('public'))

app.get('/',(req,res)=>{
  fs.createReadStream('public/home.html').pipe(res)
})

app.get('/error',(req,res)=>{
  fs.createReadStream('public/error.html').pipe(res)
})

app.post('/register',async (req,res)=>{
  if(req.cookies.id != undefined){
    res.redirect('/')
    return
  }
  info = {
    username: req.body.user,
    id: nanoid(10)
  }
  info.password = await bcrypt.hash(req.body.password,12)
  body = await fetch(`${dbURL}/${info.username}`)
  body = await body.json()
  if(body[0] != undefined){
    fs.createReadStream(`public/error.html`).pipe(res)
    return
  }
  body = await fetch(`${dbURL}/${info.username}`,{
    method: 'POST',
    body: JSON.stringify(info),
    headers: {
      'Content-Type':'application/json'
    }
  })
  res.cookie('id',info.id)
  res.redirect('/')
})

app.post('/login',async (req,res)=>{
  if(req.cookies.id != undefined){
    res.redirect('/')
    return
  }
  info = {
    username: req.body.user,
    password: req.body.password
  }
  body = await fetch(`${dbURL}/${info.username}`)
  body = await body.json()
  if(body[0] == undefined){
    fs.createReadStream(`public/error.html`).pipe(res)
    return
  }
  res.cookie('id',body[0].id)
})

app.get('/logout',(req,res)=>{
  res.clearCookie('id')
  res.redirect('/')
})

app.listen(port,()=>{
  console.log(`Listening on port ${port}`)
})