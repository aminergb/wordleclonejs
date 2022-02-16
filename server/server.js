//we create an api that serves the apis
import express from "express"
import axios from "axios"
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
const app = express()

app.use(cors())

app.get("/api/word", (req, res) => {
    //fetch is not supported by node :

    var options = {
        method: 'GET',
        url: 'https://random-words5.p.rapidapi.com/getRandom',
        params: { wordLength: '5' },
        headers: {
            'x-rapidapi-host': 'random-words5.p.rapidapi.com',
            'x-rapidapi-key': process.env.RAPID_API_KEY
        }
    };
    axios.request(options).then(function (response) {
        res.json(response.data);
    }).catch(function (error) {
        throw new Error(error)
    });
})

app.listen(4008, () => { console.log("listening") })