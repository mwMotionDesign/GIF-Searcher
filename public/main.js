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

// postToDatabase();

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

const inputField = document.getElementById("inputField");
const result = document.getElementById("result");
const returnDiv = document.getElementById("returnDiv");

inputField.focus();

const buttonFetch = document.getElementById("buttonFetchInput");
const buttonGenerate = document.getElementById("buttonGenerateInput");
const buttonAIGenerate = document.getElementById("buttonAIGenerateInput");

const legendeSearchGif = document.getElementById("legendeSearchGif");
const legendeRandomWord = document.getElementById("legendeRandomWord");
const legendeAskAI = document.getElementById("legendeAskAI");
const legendeSwitchImages = document.getElementById("legendeSwitchImages");
const legendeChangeGifAmount = document.getElementById("legendeChangeGifAmount");

buttonFetch.addEventListener("click", (e) => {
    e.preventDefault;
    searchForGif();
});
buttonGenerate.addEventListener("click", (e) => {
    e.preventDefault;
    generateRandomWord();
});
buttonAIGenerate.addEventListener("click", (e) => {
    e.preventDefault;
    generateAIresponse();
});

legendeSearchGif.addEventListener("click", (e) => {
    e.preventDefault;
    searchForGif();
});
legendeRandomWord.addEventListener("click", (e) => {
    e.preventDefault;
    generateRandomWord();
});
legendeAskAI.addEventListener("click", (e) => {
    e.preventDefault;
    generateAIresponse();
});
legendeSwitchImages.addEventListener("click", (e) => {
    e.preventDefault;
    switchImages();
    inputField.focus();
    inputField.select();
});
legendeChangeGifAmount.addEventListener("click", (e) => {
    e.preventDefault;
    changeNumberOfGifs();
    inputField.focus();
    inputField.select();
});

document.addEventListener("keypress", (event) => {
    if (event.key === ";") {
        event.preventDefault();
        changeNumberOfGifs();
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
    const imgContain = document.querySelectorAll(".resultIMGhidden");
    const imgCover = document.querySelectorAll(".resultIMG");

    if (!imageContain || newSiteLoad) {
        imgContain.forEach(el => {
            el.style.opacity = 1;
            el.style.transform = "translate(-0%, -101.5%) scale(1)";
        });
        imgCover.forEach(el => {
            el.style.opacity = 0.75;
            el.style.filter = "brightness(0.0)";
        });

        imageContain = true;
        console.log("Image is switched to contain\n\n")
    }
    else if (imageContain) {
        imgContain.forEach(el => {
            el.style.opacity = 0;
            el.style.transform = "translate(-0%, -101.5%) scale(1.2)";
        });
        imgCover.forEach(el => {
            el.style.opacity = 1;
            el.style.filter = "brightness(1)";
        });

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

        searchForGif();

        inputField.focus();
        inputField.select();
    } catch (error) {
        console.log("WORD-GENERATOR RESPONSE ERROR:");
        console.error(error);
    }
}

let nOfGIFs = 6;
let gifsToDownload = 30;
let gifSizeToDownload = "fixed_width";

let currentNofGIFs = nOfGIFs;
let startGIF = 0;
let endGIF = 14;
let searchTerm = inputField.value;
let responseJSON;
let gifLinkData;
let historySearch = false;
let fetchMoreGifs = false;
let newSearch = true;

let offset = 0;
let lastGIFreached = false;
let firstGIFlength = 0;

// DEBUG
let firstSearch = true;

inputField.value = "Welcome";
firstSearch = true;
searchForGif();
inputField.value = "";

async function searchForGif() {
    newSiteLoad = true;

    if (!firstSearch && searchTerm == inputField.value && searchTerm != "" && !lastGIFreached) {
        newSearch = false;

        if (endGIF + 1 < gifLinkData.length) {
            console.log("Last GIF < ListLength");
            startGIF = currentNofGIFs;
            currentNofGIFs = currentNofGIFs + nOfGIFs;
            endGIF = (currentNofGIFs) - 1;
            offset = offset + nOfGIFs;
        }
        else {
            console.log("Last GIF >= ListLength");
            startGIF = 0;
            endGIF = nOfGIFs - 1;
            currentNofGIFs = nOfGIFs;

            try {
                console.log("Connecting to GIF Server for more GIFs ...");
                const response = await fetch("/getGIFrequest".concat("?searchTerm=", searchTerm, "&offset=", offset, "&gifsToDownload=", gifsToDownload));
                responseJSON = await response.json();
                console.log("- Done!");
                console.log(responseJSON.data.data);
            } catch (error) {
                console.log("GIF RESPONSE ERROR:");
                console.error(error);
            }

            offset = offset + nOfGIFs;
        }

        appendGIFsToSite(responseJSON.data.data);
    }
    else {
        if (searchTerm != inputField.value) {
            lastGIFreached = false;
        }
        newSearch = true;
        startGIF = 0;
        endGIF = nOfGIFs - 1;
        currentNofGIFs = nOfGIFs;
        offset = 0;

        if (inputField.value == "") {
            inputField.value = "404";
        }

        if (!firstSearch && !historySearch && !lastGIFreached) {
            addReturnText("Search: ", inputField.value);
        }
        else {
            historySearch = false;
            firstSearch = false;
        }

        searchTerm = inputField.value;
        lastGIFreached = false;

        try {
            console.log("Connecting to GIF Server for new Search ...");
            const response = await fetch("/getGIFrequest".concat("?searchTerm=", searchTerm, "&offset=", offset, "&gifsToDownload=", gifsToDownload));
            responseJSON = await response.json();
            console.log("- Done!");

            offset = nOfGIFs;

            console.log(responseJSON.data.data);
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
            if (lastGIFreached) {
                searchForGif();
            }
            else {
                let newDiv = document.createElement("div");
                newDiv.classList.add("resultDivText");

                let p = document.createElement("p");
                p.classList.add("resultText");

                newDiv.appendChild(p);
                result.appendChild(newDiv);

                if (i == 0) {
                    result.style.justifyContent = "center";
                }

                allImagesFound = i;
                p.innerHTML = calculateNofGIFs();

                function calculateNofGIFs() {
                    if (allImagesFound < nOfGIFs || allImagesFound <= firstGIFlength && offset - nOfGIFs <= firstGIFlength) {
                        return allImagesFound + " GIFs found!";
                    }
                    else if (offset >= firstGIFlength) {
                        return Math.floor(offset / firstGIFlength) * firstGIFlength + allImagesFound + " GIFs found!";
                    }
                    // hogwashes = 7 GIFS
                    // allays = 22 GIFS
                    // Olivia Wilde = 155 GIFS
                }

                logGIFinfo(gifLinkData);

                lastGIFreached = true;

                return;
            }
        }
        else if (i <= endGIF) {
            let newDiv = document.createElement("div");
            newDiv.classList.add("resultDiv");

            let newA = document.createElement("a");
            newA.href = gifLinkData[i].images[gifSizeToDownload].url;
            newA.setAttribute('target', '_blank');

            let newIMG = document.createElement("img");
            newIMG.classList.add("resultIMG");
            newIMG.src = gifLinkData[i].images[gifSizeToDownload].url;

            let newIMGhidden = document.createElement("img");
            newIMGhidden.classList.add("resultIMGhidden");
            newIMGhidden.src = gifLinkData[i].images[gifSizeToDownload].url;

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
            console.log("- GIF List Length: " + gifLinkData.length);
            if (gifLinkData.length > firstGIFlength || newSearch) {
                firstGIFlength = gifLinkData.length;
            }
            if (allImagesFound == endGIF + 1) {
                console.log("- " + allImagesFound + " GIFs of List posted!")
                console.log("- " + offset + " Offset")
            }
            else {
                console.log("- " + i + " GIFs of List posted! - End of List")
                console.log("- " + offset + " Offset")
            }
            console.log("");
        }

        newSiteLoad = false;

        inputField.focus();
        inputField.select();
    }
}

function copyLinkToClipboard() {
    let copyURL = this.previousSibling.href;

    // from:
    // https://media4.giphy.com/media/l0MYGb1LuZ3n7dRnO/100.gif?cid=d15746c13ca0f9b9c3sz9wme7gs3pllccath7etn352bmqce&rid=100.gif&ct=g
    // to:
    // https://media4.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.webp?cid=d15746c13ca0f9b9c3sz9wme7gs3pllccath7etn352bmqce&rid=giphy.webp&ct=g

    let urlArray = copyURL.split("/");
    let urlArray2 = urlArray[5].split("?");
    let urlArray3 = urlArray2[1].split("&");

    let newURL = urlArray[0].concat("//", urlArray[2], "/", urlArray[3], "/", urlArray[4], "/giphy.webp?", urlArray3[0], "&rid=giphy.webp&ct=g");

    // console.log(copyURL);
    // console.log(urlArray);
    // console.log(urlArray2);
    // console.log(urlArray3);
    // console.log(newURL);

    navigator.clipboard.writeText(newURL);
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

        // const responseAI = await fetch("/postAIrequest", options);       // Davinci 003
        const responseAI = await fetch("/postAIrequestTurbo", options);     // GPT 3.5 Turbo
        const jsonAI = await responseAI.json();
        console.log("AI Response:");
        console.log(jsonAI);
        console.log("");


        addReturnText("AI&nbsp;&nbsp;&nbsp;Q: " + inputField.value + "&nbsp;&nbsp;&nbsp;A: " + jsonAI.data, "");

        inputField.value = jsonAI.data;

        console.log("Button AI Generate: " + jsonAI.data + "\n\n");

        searchForGif();

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

    if (inputField.value != event.target.textContent) {
        inputField.value = event.target.textContent;
        inputField.focus();
        inputField.select();

        console.log("\nSetting history Event: " + event.target.textContent + "\n");

        historySearch = true;

        searchForGif();
    }
}

function changeNumberOfGifs() {
    let tempNumber = nOfGIFs;

    if (tempNumber == 6) {
        console.log("Changing to 15 GIFs");
        nOfGIFs = 15;
        gifsToDownload = 90;
        gifSizeToDownload = "fixed_height_small";

        document.documentElement.style.setProperty('--widthDesktop', "18.5%");
        document.documentElement.style.setProperty('--heightDesktop', "30.5%");
        document.documentElement.style.setProperty('--widthTablet', "18%");
        document.documentElement.style.setProperty('--heightTablet', "30.5%");
        document.documentElement.style.setProperty('--widthMobile', "30.5%");
        document.documentElement.style.setProperty('--heightMobile', "18%");
        document.documentElement.style.setProperty('--widthMini', "45%");
        document.documentElement.style.setProperty('--heightMini', "11%");

        firstSearch = true;
        searchForGif();
    }
    else if (tempNumber == 15) {
        console.log("Changing to 6 GIFs");
        nOfGIFs = 6;
        gifsToDownload = 30;
        gifSizeToDownload = "fixed_width";

        document.documentElement.style.setProperty('--widthDesktop', "30%");
        document.documentElement.style.setProperty('--heightDesktop', "45%");
        document.documentElement.style.setProperty('--widthTablet', "30%");
        document.documentElement.style.setProperty('--heightTablet', "45%");
        document.documentElement.style.setProperty('--widthMobile', "45%");
        document.documentElement.style.setProperty('--heightMobile', "30%");
        document.documentElement.style.setProperty('--widthMini', "95%");
        document.documentElement.style.setProperty('--heightMini', "15%");

        firstSearch = true;
        searchForGif();
    }
};

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