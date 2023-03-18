// console.clear();
console.log = function () { }

// Geo Loctaion Check
// getGeoLocation();

function getGeoLocation() {
    if ("geolocation" in navigator) {
        console.log("GeoData available");
        navigator.geolocation.getCurrentPosition((position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            console.log("- Lat: " + lat + "\n- Lon: " + lon + "\n\n");
        });
    }
    else {
        console.log("GeoData not available\n\n")
    }
}

// Test Post and Get Server

const dateOnEntry = Date.now();

postToDatabase();

async function postToDatabase() {
    const data = { log: "", time: dateOnEntry };

    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };

    const response = await fetch("/postToDB", options);
    const responseJSON = await response.json();
    console.log("Post Response:");
    console.log(responseJSON);
    console.log("");
}

// getFromDatabase();

async function getFromDatabase() {
    const response = await fetch("/getFromDB");
    const responseJSON = await response.json();
    console.log("Get Response:");
    console.log("Database Length: " + responseJSON);
    console.log("");
}

// Main Code

const buttonFetch = document.getElementById("buttonFetchInput");
const buttonGenerate = document.getElementById("buttonGenerateInput");
const buttonAIGenerate = document.getElementById("buttonAIGenerateInput");
const inputField = document.getElementById("inputField");
const result = document.getElementById("result");
const returnDiv = document.getElementById("returnDiv");

inputField.focus();

buttonFetch.addEventListener("click", searchForGif);
buttonGenerate.addEventListener("click", generateRandomWord);
buttonAIGenerate.addEventListener("click", generateAIresponse);

document.addEventListener("keypress", (event) => {
    if (event.key === ";") {
        event.preventDefault();
        inputField.focus();
        inputField.select();
    }
    if (event.key === ":") {
        event.preventDefault();
        generateRandomWord();
    }
    if (event.key === "_") {
        event.preventDefault();
        switchImages();
    }
    if (event.shiftKey) {
        if (event.key === "Enter") {
            event.preventDefault();
            generateAIresponse();
        }
        else if (event.key === "+") {
            event.preventDefault();
            getAImodels();
        }
    }
    else if (event.key === "Enter") {
        event.preventDefault();
        searchForGif();
    }
});

let imageContain = false;
let newSiteLoad = false;

function switchImages() {
    if (!imageContain || newSiteLoad) {
        const imgContain = document.querySelectorAll(".resultIMGhidden");
        const imgCover = document.querySelectorAll(".resultIMG");

        imgContain.forEach(el => {
            el.style.opacity = 1;
            el.style.transform = "translate(-0%, -101.5%) scale(1)";
        });
        imgCover.forEach(el => {
            el.style.opacity = 0.75;
            el.style.filter = "brightness(0.0) blur(0px)";
        });

        imageContain = true;
        newSiteLoad = false;
        console.log("Image is switched to contain\n\n")
    }
    else if (imageContain) {
        appendGIFsToSite(responseJSON.data.data);

        imageContain = false;
        console.log("Image is switched back to cover\n\n")
    }
}

async function generateRandomWord() {
    const randomWordGenerator = "https://random-word-api.herokuapp.com/word";

    try {
        let promiseWord = await fetch(randomWordGenerator);
        let jsonWord = await promiseWord.json();
        let randomWord = jsonWord[0];

        inputField.value = randomWord;

        console.log("Button Generate: " + randomWord);

        inputField.focus();
        inputField.select();
    } catch (error) {
        console.log("WORD-GENERATOR RESPONSE ERROR:");
        console.error(error);
    }
}

const nOfGIFs = 15;
let startGIF = 0;
let endGIF = 14;
let data = inputField.value;
let responseJSON;
let gifLinkData;

// DEBUG
// inputField.value = "Welcome";
// searchForGif();
inputField.value = "";

async function searchForGif() {
    newSiteLoad = true;

    if (data == inputField.value && data != "") {
        // console.log("Asking: ");
        // console.log("data Length: " + gifLinkData.length);
        // console.log("endGIF: " + endGIF);
        // console.log("startGIF: " + startGIF);

        if (startGIF == 0 && endGIF < gifLinkData.length) {
            startGIF = nOfGIFs;
            endGIF = (nOfGIFs * 2) - 1;
        }
        else if (startGIF == nOfGIFs && endGIF < gifLinkData.length) {
            startGIF = nOfGIFs * 2;
            endGIF = (nOfGIFs * 3) - 1;
        }
        else if (startGIF == nOfGIFs * 2 && endGIF < gifLinkData.length) {
            startGIF = nOfGIFs * 3;
            endGIF = (nOfGIFs * 4) - 1;
        }
        else {
            startGIF = 0;
            endGIF = nOfGIFs - 1;
        }

        appendGIFsToSite(responseJSON.data.data);
    }
    else {
        startGIF = 0;
        endGIF = nOfGIFs - 1;

        if (inputField.value == "") {
            inputField.value = "404";
        }

        addReturnText("Search: ", inputField.value);

        data = inputField.value;

        try {
            console.log("Connecting to GIF Server ...");
            const response = await fetch("/getGIFrequest/".concat(data));
            responseJSON = await response.json();
            console.log("- Done!");

            appendGIFsToSite(responseJSON.data.data);
        } catch (error) {
            console.log("GIF RESPONSE ERROR:");
            console.error(error);
        }
    }
}

let buttonCopy;

function appendGIFsToSite(gifData) {
    let allImagesFound = 0;
    gifLinkData = gifData;

    result.innerHTML = "";
    result.style.justifyContent = "space-around";

    for (i = startGIF; i <= endGIF; i++) {
        if (gifLinkData[i] === undefined) {
            let newDiv = document.createElement("div");
            newDiv.classList.add("resultDivText");

            let p = document.createElement("p");
            p.classList.add("resultText");

            newDiv.appendChild(p);
            result.appendChild(newDiv);

            if (i == 0) {
                result.style.justifyContent = "center";
            }

            p.innerHTML = i + " GIFs found!";
            allImagesFound = i;

            logGIFinfo(gifLinkData);

            return;
        }
        else if (i <= endGIF) {
            let newDiv = document.createElement("div");
            newDiv.classList.add("resultDiv");

            let newA = document.createElement("a");
            newA.href = gifLinkData[i].images["fixed_height_small"].url;
            newA.setAttribute('target', '_blank');

            let newIMG = document.createElement("img");
            newIMG.classList.add("resultIMG");
            newIMG.src = gifLinkData[i].images["fixed_height_small"].url;

            let newIMGhidden = document.createElement("img");
            newIMGhidden.classList.add("resultIMGhidden");
            newIMGhidden.src = gifLinkData[i].images["fixed_height_small"].url;

            let newCopy = document.createElement("button");
            newCopy.classList.add("copyButton");
            newCopy.textContent = 'COPY';
            newCopy.addEventListener("click", copyLinkToClipboard);

            newA.appendChild(newIMG);
            newA.appendChild(newIMGhidden);
            newDiv.appendChild(newA);
            newDiv.appendChild(newCopy);
            result.appendChild(newDiv);

            if (i == endGIF) {
                allImagesFound = endGIF + 1;
                logGIFinfo(gifLinkData);
            }
        }
    }

    function logGIFinfo(gifLinkData) {
        if (imageContain && newSiteLoad) {
            switchImages();
        }

        if (newSiteLoad) {
            console.log("Button Fetch: " + inputField.value);
            if (allImagesFound == endGIF + 1) {
                console.log("- " + allImagesFound + " GIFs posted!")
            }
            else {
                console.log("- " + i + " GIFs posted!")
            }
            console.log("Get GIFs Response:");
            console.log("GIF List Length: " + gifLinkData.length);
            console.log("");
        }

        newSiteLoad = false;

        inputField.focus();
        inputField.select();
    }
}

function copyLinkToClipboard() {
    let copyURL = this.previousSibling.href;
    navigator.clipboard.writeText(copyURL);
    console.log("Copied Link to clipboard: " + copyURL);
}

async function generateAIresponse() {
    const data = { prompt: inputField.value };

    try {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

        const responseAI = await fetch("/postAIrequest", options);
        const jsonAI = await responseAI.json();
        console.log("AI Response:");
        console.log(jsonAI);
        console.log("");


        addReturnText("AI&nbsp;&nbsp;&nbsp;Q: " + inputField.value + "&nbsp;&nbsp;&nbsp;A: " + jsonAI.data, "");

        inputField.value = jsonAI.data;

        console.log("Button AI Generate: " + jsonAI.data + "\n\n");

        inputField.focus();
        inputField.select();
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}

function addReturnText(text, search) {
    console.log(text, search);

    let newText = document.createElement("p");
    newText.classList.add("returnText");

    if (search != "") {
        let newA = document.createElement("a");
        newA.classList.add("linkToInput");
        newA.href = "#";
        newA.textContent = search;
        newA.addEventListener("click", linkToInput);

        newText.appendChild(document.createTextNode(text));
        newText.appendChild(newA);

        returnDiv.appendChild(newText);
    }
    else {
        newText.innerHTML = text;
        returnDiv.appendChild(newText);
    }

}

function linkToInput(event) {
    event.preventDefault;

    inputField.value = event.target.textContent;
    inputField.focus();
    inputField.select();

    console.log("\nSetting history Event: " + event.target.textContent + "\n");

    searchForGif();
}

async function getAImodels() {
    try {
        const responseAI = await fetch("/getAImodels");
        const jsonAI = await responseAI.json();
        const aiObject = jsonAI.responseObject;

        console.log("AI Models:");
        let tempString = "";

        for (let i = 0; i < aiObject.length; i++) {
            tempString = tempString.concat("- ", aiObject[i].model, "\n");
        }

        console.log(tempString);
        console.log("");
    } catch (error) {
        console.log("AI RESPONSE ERROR:");
        console.error(error);
    }
}