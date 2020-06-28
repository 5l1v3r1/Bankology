const express = require('express')
const bodyParser = require('body-parser')
const fs = require('fs')
const port = process.env.PORT || 3000
const bcrypt = require('bcrypt')
const { nanoid } = require('nanoid')
const fetch = require('node-fetch')
const cookieParser = require('cookie-parser')
const quiz = require('./quizzes.json')

dbURL = process.env.DBURL

app = express()

app.use(cookieParser())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(express.static('public'))

app.get('/', (req, res) => {
  fs.createReadStream('public/home.html').pipe(res)
})

app.get('/error', (req, res) => {
  fs.createReadStream('public/error.html').pipe(res)
})

app.post('/register', async (req, res) => {
  if (req.cookies.id != undefined) {
    res.redirect('/')
    return
  }
  info = {
    username: req.body.user.toLowerCase(),
    id: nanoid(10),
    answers: {
      'test': true
    }
  }
  info.password = await bcrypt.hash(req.body.password, 12)
  body = await fetch(`${dbURL}/${info.username}`)
  body = await body.json()
  if (body[0] != undefined) {
    fs.createReadStream(`public/error.html`).pipe(res)
    return
  }
  body = await fetch(`${dbURL}/${info.username}`, {
    method: 'POST',
    body: JSON.stringify(info),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  body = await fetch(`${dbURL}/${info.id}`, {
    method: 'POST',
    body: JSON.stringify(info),
    headers: {
      'Content-Type': 'application/json'
    }
  })
  res.cookie('id', info.id)
  res.redirect('/')
})

app.post('/login', async (req, res) => {
  if (req.cookies.id != undefined) {
    res.redirect('/')
    return
  }
  info = {
    username: req.body.user.toLowerCase(),
    password: req.body.password
  }
  body = await fetch(`${dbURL}/${info.username}`)
  body = await body.json()
  if (body[0] == undefined) {
    fs.createReadStream(`public/error.html`).pipe(res)
    return
  }
  res.cookie('id', body[0].id)
  res.redirect('/')
})

app.get('/logout', (req, res) => {
  res.clearCookie('id')
  res.redirect('/')
})


app.get('/quiz', async (req, res) => {
  id = req.cookies.id
  if (req.query.url == undefined || req.query.n == undefined) {
    res.end(`no - famous hackermon quote`)
    return
  }
  if (id != undefined) {
    body = await fetch(`${dbURL}/${id}`)
    body = await body.json()
    if (body[0] == undefined) {
      res.redirect('/error')
      console.log('here4')
      return
    }
    if (body[0].answers[req.query.url] != undefined && body[0].answers[req.query.url][req.query.n] != undefined) {
      res.json({
        alreadyAnswered: true
      })
      return
    }
  }

  if (quiz[req.query.url][req.query.n] == undefined) {
    res.json({
      none: true
    })
    return
  }
  info = JSON.parse(JSON.stringify(quiz[req.query.url][req.query.n]))
  /* Hide the answer and explanation*/
  info.answer = undefined
  info.explanation = undefined
  res.json(info)
})

app.post('/quiz', async (req, res) => {
  id = req.cookies.id
  questionID = req.body.id
  name = req.body.name
  if (questionID == undefined || name == undefined) {
    res.json({
      error: true,
      explanation: 'There was an unknown error on our server. Please just reload the page'
    })
    return
  }
  realAnswer = quiz[name][questionID].answer
  answer = req.body['answer']
  if (answer != realAnswer) {
    res.json({
      incorrect: true,
      explanation: quiz[name][questionID].explanation,
      answer: quiz[name][questionID].answer
    })
  } else {
    res.json({
      answer: quiz[name][questionID].answer
    })
  }
  if (id != undefined) {
    body = await fetch(`${dbURL}/${id}`)
    body = await body.json()
    if (body[0] == undefined) {
      res.redirect('/error')
      return
    }
    info = body[0]
    if (info['answers'][name] == undefined) {
      info['answers'][name] = {}
    }
    info['answers'][name][questionID] = true
    body = await fetch(`${dbURL}/${id}`, {
      method: 'POST',
      body: JSON.stringify(info),
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
})

app.listen(port, () => {
  console.log(`Listening on port ${port}`)
})