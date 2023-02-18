const { MongoClient, ServerApiVersion } = require('mongodb');
require("dotenv").config()
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 4000;
const { Configuration, OpenAIApi } = require("openai");

app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.PASS}@cluster0.ylyrso9.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    await client.connect();

    try {
        app.get('/', async (req, res) => {
            res.send({
                message: "Welcome to Chatbot Server"
            })
        })

        app.get("/messages", async (req, res) => {
            const query = {};

            const collection = client.db('chatbot').collection('messages')
            const cursor = collection.find(query);
            const messages = await cursor.toArray();

            res.send(messages)
        })

        app.get("/query/:data", async (req, res) => {
            const configuration = new Configuration({
                apiKey: process.env.OPENAI_API_KEY,
            });
            const openai = new OpenAIApi(configuration);

            try {
                await client.connect();

                const collection = client.db('chatbot').collection('messages')

                const completion = await openai.createCompletion({
                    model: "text-davinci-002",
                    prompt: req.params.data,
                    temperature: 0,
                    max_tokens: 3000,
                    top_p: 1,
                    frequency_penalty: 0.5,
                    presence_penalty: 0,
                });
                const data = {
                    message: req.params.data,
                    reply: completion.data.choices[0].text
                };
                const cursor = collection.insertOne(data);
                const reply = cursor.toArray()

                res.send(completion.data.choices[0]);
            } catch (error) {
                if (error.response) {
                    console.log(error.response.status);
                    res.send({ message: error.response.data.error.message });
                } else {
                    console.log(error.message);
                }
            }
        })
    }
    catch (err){
        console.log(err);
    }
}

run().catch(console.dir)

app.listen(port, () => console.log(`listening on port ${port}`))