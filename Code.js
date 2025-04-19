function onOpen() {
    showUI()
}

function showConnection() {
    DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutputFromFile('Connection').setWidth(500).setHeight(100), 'Connect to AstraDB')
}

function showImageDialog() {
    DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutputFromFile('imageDialog').setWidth(1000).setHeight(1000), 'How to connect')
}

function showHelp() {
    DocumentApp.getUi().showModalDialog(HtmlService.createHtmlOutputFromFile('Help').setWidth(600).setHeight(650), 'Semantic Search – Help')
}

function showUI() {
    DocumentApp.getUi().showSidebar(HtmlService.createHtmlOutputFromFile('Searchbar').setTitle('Semantic Search'))
}

function saveCredentials(endpoint, token) {
    endpoint = endpoint.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const p = PropertiesService.getUserProperties();
    p.setProperty('ASTRA_ENDPOINT', endpoint);
    p.setProperty('ASTRA_TOKEN', token);
    p.setProperty('ASTRA_KEYSPACE', 'default_keyspace')
}

function _getCredentials() {
    const p = PropertiesService.getUserProperties();
    const endpoint = p.getProperty('ASTRA_ENDPOINT');
    const token = p.getProperty('ASTRA_TOKEN');
    const keyspace = p.getProperty('ASTRA_KEYSPACE') || 'default_keyspace';
    if (!endpoint || !token) throw new Error('Missing AstraDB credentials');
    return {endpoint, token, keyspace}
}

function reloadAndIndex(chunkSize, overlap) {
    const {endpoint, token, keyspace} = _getCredentials();
    const collectionName = 'c_' + Utilities.getUuid().replace(/-/g, '');
    PropertiesService.getUserProperties().setProperty('ASTRA_COLLECTION', collectionName);
    const bodyText = DocumentApp.getActiveDocument().getBody().getText();
    const chunks = splitTextIterative(bodyText, parseInt(chunkSize, 10), parseInt(overlap, 10));
    createVectorCollection(collectionName, keyspace, endpoint, token);
    let batch = [];
    let inserted = 0;
    chunks.forEach((txt, idx) => {
        batch.push({id: idx, text: txt, $vectorize: txt});
        if (batch.length === 100) {
            insertManyDocuments(collectionName, keyspace, endpoint, token, batch);
            inserted += batch.length;
            batch = []
        }
    });
    if (batch.length) {
        insertManyDocuments(collectionName, keyspace, endpoint, token, batch);
        inserted += batch.length
    }
    return {collectionName, totalChunks: chunks.length, inserted: inserted}
}

function searchServer(queryText, topK) {
    const {endpoint, token, keyspace} = _getCredentials();
    const collectionName = PropertiesService.getUserProperties().getProperty('ASTRA_COLLECTION');
    if (!collectionName) throw new Error('No collection; reload first');
    const resp = searchDocuments(collectionName, keyspace, endpoint, token, queryText, parseInt(topK, 10));
    const docs = (resp && resp.data && resp.data.documents) ? resp.data.documents : [];
    return docs.map(d => ({similarity: d['$similarity'] || d.similarity, text: d.text || ''}))
}

function highlightResult(text, similarity) {
    const body = DocumentApp.getActiveDocument().getBody();
    const found = body.findText(text);
    if (!found) return false;
    const el = found.getElement().asText();
    const start = found.getStartOffset();
    const end = found.getEndOffsetInclusive();
    const r = Math.round(255 * (1 - similarity));
    const g = Math.round(255 * similarity);
    const hex = n => ('0' + n.toString(16)).slice(-2);
    const color = '#' + hex(r) + hex(g) + '00';
    el.setBackgroundColor(start, end, color);
    const doc = DocumentApp.getActiveDocument();
    const range = doc.newRange().addElement(el).build();
    doc.setSelection(range);
    DocumentApp.flush();
    return true
}

function createVectorCollection(collectionName, keyspace, astraEndpoint, token, dimension, metric, modelName) {
    dimension = dimension || 1024;
    metric = metric || 'cosine';
    modelName = modelName || 'NV-Embed-QA';
    const url = 'https://' + astraEndpoint + '/api/json/v1/' + keyspace;
    const payload = {
        createCollection: {
            name: collectionName,
            options: {
                vector: {
                    dimension: dimension,
                    metric: metric,
                    service: {provider: 'nvidia', modelName: modelName}
                }
            }
        }
    };
    const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: {Token: token},
        payload: JSON.stringify(payload)
    });
    return JSON.parse(res.getContentText())
}

function insertManyDocuments(collectionName, keyspace, astraEndpoint, token, documents) {
    const url = 'https://' + astraEndpoint + '/api/json/v1/' + keyspace + '/' + collectionName;
    const payload = {insertMany: {documents: documents}};
    const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: {Token: token},
        payload: JSON.stringify(payload)
    });
    return JSON.parse(res.getContentText())
}

function searchDocuments(collectionName, keyspace, astraEndpoint, token, queryText, n) {
    const url = 'https://' + astraEndpoint + '/api/json/v1/' + keyspace + '/' + collectionName;
    const payload = {find: {sort: {$vectorize: queryText}, options: {limit: n, includeSimilarity: true}}};
    const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: {Token: token},
        payload: JSON.stringify(payload)
    });
    return JSON.parse(res.getContentText())
}

function splitTextIterative(text, maxLength, overlap) {
    const step = Math.max(1, maxLength - Math.min(overlap, maxLength - 1));
    const out = [];
    for (let pos = 0; pos < text.length; pos += step) {
        const chunk = text.slice(pos, Math.min(pos + maxLength, text.length));
        out.push(chunk);
        if (chunk.length < maxLength) break
    }
    return out
}
