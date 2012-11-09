"use strict";

var tedious = require('tedious'),
    TYPES   = tedious.TYPES;

module.exports = function(connectionData, spMapping, callback) {

    connectionData.options = {
        connectTimeout : 1000,
        requestTimeout : 1000,
        cancelTimeout  : 1000
    };

    var connection = new tedious.Connection(connectionData);

    connection.on('connect', function(err) {
        if(err) {
            console.log(err);
            connection.close();
        } else {
            callback(err, invoker);
        }
    });

    function invoker(spName, map) {
        spName = spMapping[spName] || spName;

        var sqlRequest = new tedious.Request(spName, function(err) {
            if (err) {
                console.log(err);
            }
            connection.close();
        });

        for(var key in map) {
            sqlRequest.addParameter(key, TYPES.VarChar, map[key].toString());
        }

        connection.callProcedure(sqlRequest);
    }

};