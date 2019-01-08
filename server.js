const express = require('express')

const fs = require('fs')
const path = require('path')
const app = express()
const port = 3000

var jdssat = require('jdssat')
jdssat = new jdssat();
jdssat.initialize();

app.get('/', (req, res) => res.send('Hello World!'))

app.listen(port, () => console.log(`app listening on port ${port}!`))

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
})

app.get('/api/treatments/:crop/:experiments', (request, response) => {
    let crop = request.params.crop;
    let experiments = request.params.experiments;
    let experimentsObj = JSON.parse(experiments);

    let treatments = jdssat.treatments(crop, experimentsObj);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(treatments));
    response.end();
})

app.get('/api/experiments/:crop', (request, response) => {
    let crop = request.params.crop;

    let experiments = jdssat.experiments(crop);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(experiments));
    response.end();

    response.end(JSON.stringify(experiments));
})

app.get('/api/data/:crop', (request, response) => {
    let crop = request.params.crop;

    let dataFiles = jdssat.getDataFiles(crop);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(dataFiles));
    response.end();
})

app.get('/api/outFiles/:crop', (request, response) => {
    let crop = request.params.crop;

    let outFiles = jdssat.outFiles(crop);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(outFiles));
    response.end();
})

app.get('/api/runSimulation/:crop/:experiments', (request, response) => {
    let crop = request.params.crop;
    let experiments = request.params.experiments;
    let experimentsObj = JSON.parse(experiments);

    jdssat.runSimulation(crop, experimentsObj, callback);

    function callback() {
        console.log('callback simulation');
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.write(JSON.stringify("success"));
        response.end();
    }


})

app.get('/api/out/:crop/:file', (request, response) => {
    let crop = request.params.crop;
    let outfile = request.params.file;

    let fileContent = jdssat.readOutFile(crop, outfile);

    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(fileContent));
    response.end();
})

app.get('/api/cde', (request, response) => {
    let cdeVariables = jdssat.cde();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.write(JSON.stringify(cdeVariables));
    response.end();
})

app.get('/api/filepreview/:crop/:file', (request, response) => {
    let cropSelected = request.params.crop;
    let file = request.params.file;
    let preview = jdssat.filePreview(cropSelected, file);

    response.writeHead(200, { 'Content-Type': 'text/html' });
    response.write(preview);
    response.end();
})

app.get('/load/:view', (request, response) => {
    let partialView = request.params.view;
    let filePath = path.join(__dirname, 'app/partial-view/' + partialView);

    fs.readFile(filePath, { encoding: 'utf-8' }, function (err, data) {
        if (!err) {
            console.log('received data: ' + data);
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(data);
            response.end();
        } else {
            console.log(err);
        }
    });
})