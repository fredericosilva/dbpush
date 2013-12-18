[![NPM](https://nodei.co/npm/dbpush.png)](https://nodei.co/npm/dbpush/)

###Example
	var dbpush = require("dbpush");
	
	var connectionData = { server : 'sql.example.com', userName : 'joe', password : '12345' };
	
	var mappings = {
		spName1 : 'long_sp_name_goes_here',
		spName2 : 'extra_long_sp_name_goes_here'
	};
	
	dbpush(connectionData, mappings, function(err, invoke) {
		invoke('spName1', {
			place      : 'warsaw'
			lat        : '52.2323',
			lon        : '21.008433'
		});
	});
