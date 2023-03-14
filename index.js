const express = require('express')
const morgan = require('morgan')

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body)
})

const app = express()
const cors = require('cors')
app.use(express.json())
app.use(cors())

app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req,res),
    tokens.status(req,res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.body(req, res)
  ].join(' ')
}))

let persons = [
  {
    name: "Arto Hellas",
    number: "040-123456",
    id: 1
  },
  {
    name: "Ada Lovelace",
    number: "39-44-5323523",
    id: 2
  },
  {
    name: "Dan Abramov",
    number: "12-43-234345",
    id: 3
  },
  {
    name: "Mary Poppendieck",
    number: "39-23-6423122",
    id: 4
  }
]

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    res.json(person)
  } else {
    res.status(404).end()
  }  
})

app.get('/info', (req, res) => {
  const date = new Date()
  res.send(
    `<p>Phonebook has info for ${persons.length} people<p>
    <p>${date}<p>`
    )
})

const generateRandomId = (max) => {
  return Math.floor(Math.random() * max)
}

const nameAddedBefore = (name) => {
  return persons.find(person => person.name === name)
}

app.post('/api/persons', (req, res) => {

  const body = req.body
  
  if (!body.name || !body.number) {
    return res.status(400).json({
      error: 'missing content'
    })
  }

  // 409 conflict, en tiedä onko paras mahdollinen koodi
  if (nameAddedBefore(body.name)) {
    return res.status(409).json({
      error: 'name must be unique'
    })
  }

  const id = generateRandomId(65536)
 
  const person = {
    name: body.name,
    number: body.number,
    id: id
  }

  persons = persons.concat(person)
  
  res.json(person)
})

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id)
  persons = persons.filter(person => person.id !== id)

  res.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
