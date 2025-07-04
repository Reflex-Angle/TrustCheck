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
