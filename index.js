"use strict";

var tedious = require('tedious'),
    async   = require("async"),
    TYPES   = tedious.TYPES;

module.exports = function(connectionData, spMapping, callback) {

    var queue = async.queue(processQueueTask, 1);

    connectionData.options = connectionData.options || {
        connectTimeout : 1000,
        requestTimeout : 1000,
        cancelTimeout  : 1000
    };

    var connection = new tedious.Connection(connectionData);

    connection.on('connect', function(err) {
        if(err) {
            console.log(err);
            connection.close();
        }
        callback(err, invoker);
    });

    function invoker(spName, map) {
        queue.push({
            sp  : spMapping[spName] || spName,
            map : map
        });
    }

    function processQueueTask(task, callback) {

        var sqlRequest = new tedious.Request(task.sp, function(err) {
            if (err) {
                console.log(err);
            }
        });

        for(var key in task.map) {
            var value = task.map[key];

            if(value === undefined) {
                continue;
            }

            if (typeof value === 'object') {
                value = JSON.stringify(value);
            }

            sqlRequest.addParameter(key, TYPES.VarChar, value.toString());
        }

        sqlRequest.on('doneProc', function(){
            process.nextTick(callback);
        });

        connection.callProcedure(sqlRequest);
    }
};
