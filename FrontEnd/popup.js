document.getElementById('fetch-reviews').addEventListener('click', () => {
    var aspect = document.getElementById("messageInput").value;

    let mes = ""
    if(aspect == ""){ mes = "alertMessage" }
    else{ mes = aspect}

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, { message: mes });
    }); 

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.verdict) {
            console.log("New message received: ", message.verdict);
            document.getElementById("out").innerHTML = message.verdict;
        }
    });

    
});