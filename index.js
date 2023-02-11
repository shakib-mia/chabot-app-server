const express = require('express');
const cors = require('cors');
require("dotenv").config()
const app = express();

app.use(cors())
// app.use(express.json())

const port = process.env.PORT || 4000;

const { Configuration, OpenAIApi } = require("openai");


app.get('/', async (req, res) => {
    // console.log(req.body);

    res.send("hello")
})

app.get("/query/:data", async (req, res) => {
    // console.log(req.body);


    const configuration = new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
    });
    const openai = new OpenAIApi(configuration);

    try {
        const completion = await openai.createCompletion({
            model: "text-davinci-002",
            prompt: req.params.data,
            temperature: 0,
            max_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0.5,
            presence_penalty: 0,
        });
        res.send(completion.data.choices[0]);
    } catch (error) {
        if (error.response) {
            console.log(error.response.status);
            console.log(error.response.data);
        } else {
            console.log(error.message);
        }
    }
})


app.listen(port, () => console.log(`listening on port ${port}`))