  document.getElementById("extractTextButton").addEventListener("click", function() {
    // Send a message to the content script to extract the text
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: "extractText" }, function(response) {
        if (response) {
          // Display the extracted text in the textarea
          document.getElementById("extractedText").value = response.text;
        } else {
          document.getElementById("extractedText").value = "No text found.";
        }
      });
    });
  });