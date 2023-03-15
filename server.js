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

app.get("/getGIFrequest/:data", async (request, response) => {
    console.log("Requesting GIFs for:");

    const data = request.params.data;
    console.log(data);

    const gifSearch = "https://api.giphy.com/v1/gifs/search?rating=r&api_key=".concat(process.env.GIPHY_KEY);

    try {
        let promiseGIF = await fetch(gifSearch.concat("&q=", data));
        let jsonGIF = await promiseGIF.json();
        console.log("Number of GIFs found:\n" + jsonGIF.data.length + "\n");

        db.loadDatabase();
        const time = Date.now();
        db.insert({ log: "Requesting GIFs", Search: data, FounGIFs: jsonGIF.data.length, time: time });

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

app.post("/postAIrequest", async (request, response) => {
    const data = request.body;
    let newPrompt = "";
    if (data.prompt != "") {
        // newPrompt = "Summarize the following sentence in a maximum of two words: ".concat(data.prompt);
        newPrompt = "Answer with a maximum of two words: ".concat(data.prompt);
    }
    else if (data.prompt == "") {
        newPrompt = "Generate an interesting word for a GIF search:";
    }
    console.log("Request AI Response for:");
    console.log(data.prompt);
    console.log("Changed to:");
    console.log(newPrompt);

    const aiConfiguration = new Configuration({
        organization: "org-g4dnutBbAzqx2x93GBqErvMy",
        apiKey: process.env.OPEN_AI_KEY
    });

    const openAI = new OpenAIApi(aiConfiguration);
    // const aiResponse = await openAI;

    const aiPrompt = {
        model: "text-davinci-003",
        prompt: newPrompt,
        max_tokens: 15,
        temperature: 0.4,
        top_p: 1,
        presence_penalty: 2,
        frequency_penalty: 2
    }

    console.log("AI Parameters: ");
    console.log(aiPrompt);

    try {
        let responseAI = await openAI.createCompletion(aiPrompt);
        let aiResponseAnswer = await responseAI.data.choices[0];

        // console.log("AI Response Object:");
        // console.log(responseAI);
        // console.log("");
        console.log("AI Response Answer:");
        console.log(aiResponseAnswer);
        console.log("");
        console.log("AI Response:");
        console.log(aiResponseAnswer.text);
        console.log("");

        db.loadDatabase();
        const time = Date.now();
        db.insert({ log: "Requesting AI", Search: data.prompt, aiResponse: aiResponseAnswer.text, time: time });

        response.json({
            status: "200 - Succesful PostRequest",
            data: aiResponseAnswer.text
        });

        response.end();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        // console.error(error);
        console.log(error);
        response.end();
    }
});