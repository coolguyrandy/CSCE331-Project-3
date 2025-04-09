function onOpen() {
  showUI(); // Call your showUI function when the document is opened
}

function showUI() {//display html
  var html = HtmlService.createHtmlOutputFromFile('Practice_index.html.html')
      .setTitle('Vector search');
  DocumentApp.getUi().showSidebar(html);
}

function processText(inputText) {
  Logger.log("User input: " + inputText);
  return "Processed: " + inputText;
}
