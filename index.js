const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express();
let persons = [
    {
        "id": "1",
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": "2",
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": "3",
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": "4",
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

// cors
app.use(cors());

// use static file to show homepage
app.use(express.static('dist'))

// json midlleware
app.use(express.json());

// define my own toke to format log
morgan.token('postdata', (req, res) => req.method === 'POST' ? JSON.stringify(req.body) : '')

// define format
morgan.format('post',':method :url :status :res[content-length] :response-time ms :postdata')

// morgan middlewate
app.use(morgan('post'))

// get person list
app.get('/api/persons', (request, response) => {
    response.json(persons);
})

// get number of person
app.get('/info', (request, response) => {
    const now = new Date();
    response.send(`Phonebook has info for ${persons.length} people <br/> ${now} `)
})

// get person by id
app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person);
    }
    else {
        response.status(404).end();
    }
})

// delete person by id
app.delete('/api/persons/:id', (request, response) => {
    const id = request.params.id;
    persons = persons.filter(person => person.id !== id);
    response.status(204).end();
})

// create a new person
app.post('/api/persons', (req,res)=>{

    // will get a reference here, so we have to new a object
    // const person = req.body;
    const person = {...req.body}
    if(!person || !person.name || !person.number){
        return res.status(400).json({
            "error":"The name or number is missing"
        })
    }
    if(persons.find(item => item.name===person.name)){
        return res.status(400).json({
            "error":"The name must be unique"
        })
    }
    person.id = generateId();
    persons = persons.concat(person);
    res.json(person);

})

const generateId = () =>{
    return Date.now().toString(36)+Math.random().toString(36).substring(2,6);
}

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`app is running on the port ${PORT}`);

})