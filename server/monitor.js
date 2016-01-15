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

    clients[token] = {
        activeSessions: [],
        hardware: []
    };

    response.json({
        token: token
    });
});

app.ws('/send', function(ws, request) {

    var token = request.get("token");

    if (!token) {
        ws.close(1002, "No token specified");
        return;
    } else if (Object.keys(clients).indexOf(code) < 0) {
        ws.close(1002, "No client found with the id " + token + "!");
        return;
    }

    console.log("Client " + token + " has connected!");

    ws.on('message', function(msg) {
        client[token].hardware = JSON.parse(msg);
        if (client[token].activeSessions.length > 0) {
            client[token].activeSessions.forEach(function(session) {
               session.send(JSON.stringify(client[token].hardware));
            });
        }
    });

});

app.ws('/receive', function(ws, request) {

    var token = request.get("client_id");

    if (!token) {
        ws.close(1002, "No client_id specified");
        return;
    } else if (Object.keys(clients).indexOf(code) < 0) {
        ws.close(1002, "No client found with the id " + token + "!");
        return;
    }

    console.log("Client " + token + " has connected!");

    client[token].activeSessions.push(ws);

    ws.on('close', function() {
        var index = client[token].activeSessions.indexOf(ws);
        client[token].activeSessions.splice(index, 1);
    });
});

app.listen(8080);