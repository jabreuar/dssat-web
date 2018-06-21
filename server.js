
const port = 3000
const dssat = require('./dssat/dssat');

const express = require('express')
const app = express()

app.use(express.static(__dirname + '/node_modules/'))
app.use(express.static(__dirname + '/assets/'))

app.use((request, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next()
})

app.get('/api/treatments/:crop/:experiments', (request, response) => {
    let crop = request.params.crop;
    let experiments = request.params.experiments;
    let experimentsObj = JSON.parse(experiments);
    dssat.initialize();
    let treatments = dssat.treatments(crop, experimentsObj);
    response.end(JSON.stringify(treatments));
})

app.get('/api/experiments/:crop', (request, response) => {
    let crop = request.params.crop;
    console.log(crop);
    dssat.initialize();
    let experiments = dssat.experiments(crop);
    response.end(JSON.stringify(experiments));
})

app.get('/api/data/:crop', (request, response) => {
    let crop = request.params.crop;
    console.log(crop);
    dssat.initialize();
    let experiments = dssat.getDataFiles(crop);
    response.end(JSON.stringify(experiments));
})

app.get('/api/outFiles/:crop', (request, response) => {
    let crop = request.params.crop;
    console.log(crop);
    dssat.initialize();
    let outFiles = dssat.outFiles(crop);

    response.end(JSON.stringify(outFiles));
})

app.get('/api/runSimulation/:crop/:experiments', (request, response) => {
    let crop = request.params.crop;
    let experiments = request.params.experiments;
    let experimentsObj = JSON.parse(experiments);

    dssat.initialize();
    dssat.runSimulation(crop, experimentsObj);

    response.end("simulations are completed");
})

app.get('/api/out/:crop/:file', (request, response) => {
    let crop = request.params.crop;
    let outfile = request.params.file;

    dssat.initialize();
    let fileContent = dssat.readOutFile(crop, outfile);

    response.end(JSON.stringify(fileContent));
})

app.get('/api/cde', (request, response) => {

    dssat.initialize();
    let cdeVariables = dssat.cde();

    response.end(JSON.stringify(cdeVariables));
})

app.listen(port)