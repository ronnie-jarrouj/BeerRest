class Util {
	
	static setGlobalVariables (globals) {
		Object.entries(globals).forEach( keyValue => {
			this.setGlobalVariable(...keyValue);
		});
	}
	
	static setGlobalVariable (key, value) {
		global[key] = value;
	}
	
	static formatBeersList (json) {
		return json.map(function (item) {
			return {
				id: item.id,
				name: item.name,
				description: item.description,
				first_brewed: item.first_brewed,
				food_pairings: item.food_pairing
			};
		});
	}
	
	static validateEmail(emailAddress) {
		return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailAddress);
	}

	static saveRequestDetails (database, request) {
		var requestDetails = [
			`domain=${request.domain}`,
			`httpVersion=${request.httpVersion}`,
			`headers=${JSON.stringify(request.headers)}`,
			`url=${request.url}`,
			`method=${request.method}`,
			`statusCode=${request.statusCode}`,
			`statusMessage=${request.statusMessage}`,
			`baseUrl=${request.baseUrl}`,
			`params=${JSON.stringify(request.params)}`,
			`query=${JSON.stringify(request.query)}`
		];
		
		database.insert({requestTime: (new Date()).getTime(), request: requestDetails});
	}

	static databaseLoader (request, response, next) {
		try {
			app.set('database', databaseEnging.load('db.nosql'));
			app.set('http-log-db', databaseEnging.load('http-log-db.nosql'));
			next();
		} catch (e) {
			console.log(e);
			response.status(500);
			response.json({message: "Database loading failure."});
		}
	}

	/* Excercise 3: Create an express middleware module. */
	static httpHeaderValidator (request, response, next){
		const xUserHttpHeader = request.get('x-user');
		const db = app.get('http-log-db');
	
		if (Util.validateEmail(xUserHttpHeader)){
			Util.saveRequestDetails(db, request);
			next();
		} else {
			response.status(400);
			response.json({message: "Bad Request. Invalid http header value x-user, must be a valid email address"});
		}
	}
	
}
module.exports = Util;