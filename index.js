require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./person')

const app = express()

// cors
app.use(cors())

// use static file to show homepage
app.use(express.static('dist'))

// json midlleware
app.use(express.json())

// define my own toke to format log
morgan.token('postdata', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : '')

// define format
morgan.format('post', ':method :url :status :res[content-length] :response-time ms :postdata')

// morgan middlewate
app.use(morgan('post'))

// get person list
app.get('/api/persons', (request, response) => {
  Person
    .find({})
    .then(result => {
      response.json(result)
    })
    .catch(error => {
      console.log('get person list faileds', error.message)
    })
})

// get number of person
app.get('/info', (request, response) => {
  const now = new Date()
  Person.estimatedDocumentCount()
    .then(result => {
      response.send(`Phonebook has info for ${result} people <br/> ${now} `)
    })
})

// get person by id
app.get('/api/persons/:id', (request, response, next) => {
  Person
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      }
      else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

// delete person by id
app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
      console.log('successfully deleted', result)
    })
    .catch(error => next(error))
})

// create a new person
app.post('/api/persons', (req, res, next) => {

  // will get a reference here, so we have to new a object
  // const person = req.body;
  const person = { ...req.body }

  Person.create(person)
    .then(result => {
      res.json(result)
    })
    .catch(error => next(error))
})

// update a person by id
app.put('/api/persons/:id', (req, res, next) => {
  const person = req.body
  Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(error => next(error))
})

const errorHandle = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === 'CastError') {
    console.log(error.message)
    return response.status(400).send({ error: 'malformatted id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({
      'error': error.message
    })
  }
  next(error)
}

app.use(errorHandle)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`app is running on the port ${PORT}`)

})