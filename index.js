"use strict";

var tedious = require('tedious')
  , async   = require('async')
  , TYPES   = tedious.TYPES
  , log     = require('util').log
;

module.exports = function(connectionData, spMapping, callback) {

    var queue = async.queue(processQueueTask, 1);
    var connection;

    connectionData.options = connectionData.options || {
        connectTimeout : 1000,
        requestTimeout : 1000,
        cancelTimeout  : 1000
    };

    init(callback);

    function init(callback){
        log('start a new connection...');

        connection = new tedious.Connection(connectionData);

        connection.on('connect', function(err) {
            log('connect');
            
            if(err) {
                console.log(err);
                connection.close();
            }

            if (callback) {
                callback(err, invoker);
            }
        });

        connection.on('end', function(err) {
            log('connection was closed');

            if(err) {
                console.log(err);
            }
            setTimeout(init, 1000);
        });
    }

    function invoker(spName, map) {

        if (typeof spName !== 'string') {
            return console.log('invalid spName', spName);
        }

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
            process.setImmediate(callback);
        });

        connection.callProcedure(sqlRequest);
    }
};

