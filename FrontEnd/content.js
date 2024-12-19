import {
    SecretsManagerClient,
    GetSecretValueCommand,
  } from "@aws-sdk/client-secrets-manager";
  
async function getReview(){
    const reviews = [];

    while (true) {
        document.querySelectorAll('.review').forEach(reviewElement => {
            const reviewText = reviewElement.querySelector('.review-text').innerText;
            reviews.push(reviewText);
        });
        const nextButtonContainer = document.querySelector('li.a-last');
        if (nextButtonContainer && nextButtonContainer.classList.contains('a-disabled')) {
            break;
        } else if (nextButtonContainer) {
            nextButtonContainer.querySelector('a').click();
            console.log("click")
            await new Promise(resolve => setTimeout(resolve, 2000));  
        } else {
            console.log("Next button not found.");
            break;
        }
    }
    console.log("All Reviews Collected:", reviews);
    return reviews
}


chrome.runtime.onMessage.addListener(async (request, sender, sendResponse) => {
    if(request.message === "alertMessage") {
        alert("Enter a aspect")
    }
    else{
        let arr = await getReview()
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
         sentance: arr,
         aspect: request.message
        });

        const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
        };

        const secret_name = "SECRET_KEY";

        const client = new SecretsManagerClient({
        region: "ap-south-1",
        });

        let response;

        try {
        response = await client.send(
            new GetSecretValueCommand({
            SecretId: secret_name,
            VersionStage: "AWSCURRENT",
            })
        );
        } catch (error) { throw error;}

        const secret = response.SecretString;

        fetch(secret, requestOptions)
        .then((response) => response.text())
        .then((result) => {
            console.log(result)
            chrome.runtime.sendMessage({ verdict: JSON.parse(result).verdict });
        })
        .catch((error) => {
            console.error(error)
            chrome.runtime.sendMessage({ verdict: "failure" });
        });
    }
});

const http = require('node:http');
const express = require('express');
const cors = require('cors');
var emojiStrip = require('emoji-strip');
const LanguageDetect = require('languagedetect');
const langDetect = new LanguageDetect();
langDetect.setLanguageType('iso2');

const port = 80;

const app = express();
app.use(cors());
app.use(express.json());

app.post('/', (req, res) => {
    let sen = req.body.sentance
    let asp = req.body.aspect

    sen = sen.map(sentence => emojiStrip(sentence.replace(/\n/g, ' ')));
    console.log(sen);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
        text: sen[0]
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow",
    };

    let result = {}

    fetch("https://q4p9kkz914.execute-api.ap-south-1.amazonaws.com", requestOptions)
    .then((response) => response.text())
    .then((result) => {
        console.log(result)
        final = JSON.parse(result)
        result = {
            verdict: final.Prediction,
        };
    
        res.json(result);
    })
    .catch((error) => {
        console.error(error)
        final = "error"
        result = {
            verdict: final,
        };
    
        res.json(result);
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});