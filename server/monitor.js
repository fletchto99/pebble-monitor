#!/usr/bin/env node

var express = require('express');
var app = express();
require('express-ws')(app);
var bodyParser = require('body-parser');

app.use(bodyParser.json());

var clients = [];

function generateRegistrationCode(length) {
    var generateRandomAlphanumericCharacter = function() {
        return (Math.floor(Math.random() * 36)).toString(36);
    };
    var res = '';
    for(var i = 0; i < length; i++) {
        res += generateRandomAlphanumericCharacter();
    }
    return res;
}

app.get('/generate', function(request, response) {
    var generateToken = function() {
        var code = generateRegistrationCode(5);
        if (Object.keys(clients).indexOf(code) > 0) {
            return generateToken();
        }
        return code;
    };

    var token = generateToken();

    clients.push({
        token: token
    });

    response.json({
        registration_code: token
    });
});

app.ws('/', function(ws, request) {

    var token = request.get("hwid");

    if (!token) {
        ws.close();
        console.log("no hardware id!");
        return;
    }

    console.log((new Date()) + " connection from client at  ");

    ws.on('connect', function() {
        //TODO: Somehow authenticate the user?? Or should this be done upon the request
    });

    ws.on('message', function(msg) {
        console.log('message ' + msg);
        //TODO: Handle messages to update the sensor data for the client
    });
});

app.listen(8080);