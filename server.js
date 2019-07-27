require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet')
const POKEDEX = require('./pokedex.json')

console.log(process.env.API_TOKEN)

const app = express()

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common'
app.use(morgan(morganSetting))
app.use(helmet())
app.use(cors())

const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`];

app.use(function validateBearerToken(req, res, next) {
    const apiToken = process.env.API_TOKEN
    const authToken = req.get('Authorization')

    if (!authToken || authToken.split(' ')[1] !== apiToken) {
        return res.status(401).json({ error: 'Unauthorized request' })
    }

    // move to the next middleware
    next();
})

function handleGetTypes(req, res) {
    res.json(validTypes)
}

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    const { name, type } = req.query
    if (!name && !type) {
        res.status(400).send('You should at least provide one query')
    }

    if (!type) {
        const result = POKEDEX.pokemon.find(pokemon => name.toLowerCase() === pokemon.name.toLowerCase())
        res.status(200).json(result);
    }

    if (!name) {
        const filtered = POKEDEX.pokemon.filter(pokemon => pokemon.type.includes(type))
        res.status(200).json(filtered);
    }

    const filteredResult = POKEDEX.pokemon.filter(pokemon => pokemon.type.includes(type)).find(pokemon => pokemon.name.toLowerCase().includes(name.toLowerCase()))
    res.status(200).json(filteredResult);
}

app.get('/pokemon', handleGetPokemon)

app.use((error, req, res, next) => {
    let response
    if (process.env.NODE_DEV === 'production') {
        response = {error: {message: 'server error'}}
    } else {
        response = { error }
    }
    res.status(500).json(response)
})

const PORT = process.env.PORT || 8000

app.listen(PORT, () => {
    console.log(`Server listening at http://localhost:${PORT}`)
})