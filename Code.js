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

function createVectorCollection(collectionName, keyspace, astraDbBaseEndpoint, token, dimension, metric, modelName) {
  dimension = dimension || 1024;
  metric = metric || "cosine";
  modelName = modelName || "NV-Embed-QA";

  const url = "https://" + astraDbBaseEndpoint + "/api/json/v1/" + keyspace;
  const payload = {
    "createCollection": {
      "name": collectionName,
      "options": {
        "vector": {
          "dimension": dimension,
          "metric": metric,
          "service": {
            "provider": "nvidia",
            "modelName": modelName
          }
        }
      }
    }
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Token": token
    },
    "payload": JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    Logger.log("Create Collection Response: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error creating collection: " + err);
    throw err;
  }
}


function insertDocument(collectionName, keyspace, astraDbBaseEndpoint, token, document) {
  const url = "https://" + astraDbBaseEndpoint + "/api/json/v1/" + keyspace + "/" + collectionName;
  const payload = {
    "insertOne": {
      "document": document
    }
  };

  const options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Token": token
    },
    "payload": JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    Logger.log("Insert Document Response: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error inserting document: " + err);
    throw err;
  }
}

function searchDocuments(collectionName, keyspace, astraDbBaseEndpoint, token, queryText, n) {
  const url = "https://" + astraDbBaseEndpoint + "/api/json/v1/" + keyspace + "/" + collectionName;
  const payload = {
    "find": {
      "sort": {"$vectorize": queryText},
      "options": {
        "limit": n,
        "includeSimilarity": true
      }
    }
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Token": token
    },
    "payload": JSON.stringify(payload)
  };

  try {
    const response = UrlFetchApp.fetch(url, options);
    const result = JSON.parse(response.getContentText());
    Logger.log("Search Documents Response: " + JSON.stringify(result));
    return result;
  } catch (err) {
    Logger.log("Error performing vector search: " + err);
    throw err;
  }
}
