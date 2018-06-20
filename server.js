
const port = 3000
const dssat = require('./dssat/dssat');
var path = require('path');

const express = require('express')
const app = express()

app.use(express.static(__dirname + '/node_modules/'))
app.use(express.static(__dirname + '/assets/'))

app.use((request, response, next) => {
    console.log(request.headers)
    next()
})

app.use((request, response, next) => {
    request.chance = Math.random()
    next()
})

app.get('/', (request, response) => {
    response.sendFile(__dirname + '/indexw.html');
})

app.get('/experiments/:crop', (request, response) => {
    let crop = request.params.crop;
    console.log(crop);
    dssat.initialize();
    let exp = dssat.experiments(crop);

    let resp = "";
    for (let i = 0; i < exp.length; i++) {
        resp += exp[i].name + " ";
    }
    resp += " platform: " + dssat.platform() + __dirname;
    response.end(resp)
})

app.listen(port)