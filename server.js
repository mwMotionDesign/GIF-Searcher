// ES6 Imports
import express, { json } from "express";
import Datastore from "nedb";
import fetch from "node-fetch";
import { } from "dotenv/config";
import { Configuration, OpenAIApi } from "openai";

// Start Code

const dbLocation = "./db/database.db";
const db = new Datastore(dbLocation);

const app = express();
app.listen(process.env.PORT, () => {
    console.log("\n\n\n---------- Server Listening! ----------\n\n\n");
});

app.use(express.static("public"));
app.use(express.json({ limit: "500kb" }));

// Post to Database

app.post("/postToDB", (request, response) => {
    const data = request.body;
    console.log("Requesting Post to Database:");
    console.log(data);

    response.json({
        status: "200 - Succesful PostRequest",
        time: data.time
    });

    db.loadDatabase();
    data.log = "Entering Site";
    // data.serverTime = Date.now();

    db.insert(data);
    console.log("- Data posted!\n");

    response.end();
});

// Get from Database

app.get("/getFromDB", (request, response) => {
    console.log("Requesting Data from Database:");

    db.find({}, (error, data) => {
        if (error) {
            console.log("DB RESPONSE ERROR:");
            console.error(error);
            response.end();
            return;
        }
        else {
            console.log("- Data received!\n");
            response.json(data.length);
            response.end();
        }
    })
});


// GIF Request

app.get("/getGIFrequest/", async (request, response) => {
    console.log("Requesting GIFs for:");

    const searchTerm = request.query.searchTerm;
    const offset = request.query.offset;
    const gifsToDownload = request.query.gifsToDownload;
    console.log("searchTerm: " + searchTerm);
    console.log("offset: " + offset);
    console.log("gifsToDownload: " + gifsToDownload);

    const gifSearch = "https://api.giphy.com/v1/gifs/search?api_key=".concat(process.env.GIPHY_KEY);

    try {
        let promiseGIF = await fetch(gifSearch.concat("&rating=r" + "&limit=", gifsToDownload, "&offset=", offset, "&q=", searchTerm));
        let jsonGIF = await promiseGIF.json();
        console.log("Number of GIFs found:\n" + jsonGIF.data.length + "\n");

        // db.loadDatabase();
        // const time = Date.now();
        // db.insert({ log: "Requesting GIFs", Search: data, FounGIFs: jsonGIF.data.length, time: time });

        response.json({
            status: "200 - Succesful PostRequest",
            data: jsonGIF
        });

        response.end();
    } catch (error) {
        console.log("GIF RESPONSE ERROR:");
        console.error(error);
        response.end();
    }
});


// Open AI Request

const aiConfiguration = new Configuration({
    organization: "org-g4dnutBbAzqx2x93GBqErvMy",
    apiKey: process.env.OPEN_AI_KEY
});

const openAI = new OpenAIApi(aiConfiguration);

app.post("/postAIrequest", async (request, response) => {
    const data = request.body;
    let newPrompt = "";
    let aiPrompt = {};

    if (data.prompt != "") {
        newPrompt = "Answer with maximum of two words: ".concat(data.prompt);

        aiPrompt = {
            model: "text-davinci-003",
            prompt: newPrompt,
            max_tokens: 20,
            temperature: 0.4,
            top_p: 1,
            presence_penalty: 2,
            frequency_penalty: 2
        }
    }
    else if (data.prompt == "") {
        newPrompt = "Generate an interesting word for a GIF search. SEED(" + getRandomInt(1111, 9999) + "):";

        aiPrompt = {
            model: "text-davinci-003",
            prompt: newPrompt,
            max_tokens: 20,
            temperature: 0.95,
            top_p: 1,
            presence_penalty: 2,
            frequency_penalty: 2
        }
    }

    console.log("Request AI Response for:");
    console.log(data.prompt);
    console.log("Changed to:");
    console.log(newPrompt);
    console.log("");

    console.log("AI Parameters: ");
    console.log(aiPrompt);
    console.log("");

    try {
        let responseAI = await openAI.createCompletion(aiPrompt);
        let aiResponseAnswer = await responseAI.data.choices[0];
        let aiAnswer = aiResponseAnswer.text;

        aiAnswer = aiAnswer.replace(/[.,!?:;]/g, "");
        aiAnswer = aiAnswer.replace(/\n/g, "");

        console.log("AI Response Answer:");
        console.log(responseAI.data.usage);
        console.log(aiResponseAnswer);
        console.log("");
        console.log("AI Response:");
        console.log(aiResponseAnswer.text);
        console.log("Changed to:");
        console.log(aiAnswer);
        console.log("");

        // db.loadDatabase();
        // const time = Date.now();
        // db.insert({ log: "Requesting AI", Search: data.prompt, aiResponse: aiResponseAnswer.text, time: time });

        response.json({
            status: "200 - Succesful PostRequest",
            data: aiAnswer
        });

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        console.error(error.response.status, ": ", error.response.statusText);
        console.error(error.response.data.error.message);
        response.end();
    }
});

app.post("/postAIrequestTurbo", async (request, response) => {
    const data = request.body;
    let newPrompt = "";
    let aiPrompt = {};

    if (data.prompt != "") {
        newPrompt = "".concat(data.prompt);

        aiPrompt = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: 'system',
                    content: 'Assistant who never uses more than two words for his response.',
                },
                {
                    role: "user",
                    content: newPrompt
                }],
            max_tokens: 20,
            temperature: 0.4,
            top_p: 1,
            presence_penalty: 2,
            frequency_penalty: 2
        }
    }
    else if (data.prompt == "") {
        newPrompt = "Generate an interesting word for a GIF search. SEED(" + getRandomInt(1111, 9999) + "):";

        aiPrompt = {
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: 'system',
                    content: 'Assistant who never uses more than two words for his response.',
                },
                {
                    role: "user",
                    content: newPrompt
                }],
            max_tokens: 20,
            temperature: 0.95,
            top_p: 1,
            presence_penalty: 2,
            frequency_penalty: 2
        }
    }

    console.log("Request AI Response for:");
    console.log(data.prompt);
    console.log("Changed to:");
    console.log(newPrompt);
    console.log("");

    console.log("AI Parameters: ");
    console.log(aiPrompt);
    console.log("");

    try {
        let responseAI = await openAI.createChatCompletion(aiPrompt);
        let aiResponseAnswer = await responseAI.data.choices[0];
        let aiAnswer = aiResponseAnswer.message.content;

        aiAnswer = aiAnswer.replace(/[.,!?:;]/g, "");
        aiAnswer = aiAnswer.replace(/\n/g, "");

        console.log("AI Response Answer:");
        console.log(responseAI.data.usage);
        console.log(aiResponseAnswer);
        console.log("");
        console.log("AI Response:");
        console.log(aiResponseAnswer.message.content);
        console.log("Changed to:");
        console.log(aiAnswer);
        console.log("");

        // db.loadDatabase();
        // const time = Date.now();
        // db.insert({ log: "Requesting AI", Search: data.prompt, aiResponse: aiResponseAnswer.text, time: time });

        response.json({
            status: "200 - Succesful PostRequest",
            data: aiAnswer
        });

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        console.error(error.response.status, ": ", error.response.statusText);
        console.error(error.response.data.error.message);
        response.end();
    }
});

app.get("/getAImodels", async (request, response) => {
    console.log("Getting AI Models: ");

    try {

        const promiseModels = await openAI.listModels();
        const jsonModels = await promiseModels.data.data;
        let responseObject = [];

        for (let i = 0; i < jsonModels.length; i++) {
            // console.log(jsonModels[i].id);
            // console.log(jsonModels[i].permission);
            responseObject[i] = {
                model: jsonModels[i].id
            };
        }
        console.log(responseObject);

        response.json({
            responseObject
        });

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        // console.error(error);
        console.log(error);
        response.end();
    }
});

// FUNCTIONS

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}