const express = require('express');
const app = express();
const PunkApi = require('./punk-api.js');
const punkApi = new PunkApi();
const NoSQL = require('nosql');
const Util = require('./util.js');
const cache = require('memory-cache');

Util.setGlobalVariables({app: app, databaseEnging: NoSQL});

/* Excercise 3: Create an express middleware module (refer to httpHeaderValidator function in util.js). */

app.use(Util.databaseLoader);
app.use(Util.httpHeaderValidator);

/* Excercise 1: Add a REST end point to retrieve a list of beers. */
app.get('/beers/:name', function(request, response){
	const beerName = request.params.name;
	/* Excercise 5: Add caching support. */
	let beersResult = cache.get(beerName);
	if (beersResult) {
		console.log(`send result for query '${beerName}' from cache`);
		response.json(beersResult);
	} else {
		const options = beerName ? {beer_name : beerName} : {};
		punkApi.getBeers(options).then(json => {
			beersResult = Util.formatBeersList(json);
			cache.put(beerName, beersResult, 10*60000); //save for 10 minutes
			response.json(beersResult);
		});		
	}
	
});

/* Excercise 2: Add a REST endpoint to allow a user to add a rating to a beer. */
app.post('/beers/ratings', function(request, response){
	//Check if all fields are provided and are valid
	const beerId = request.body.id;
	const rating = request.body.rating;
	const comment = request.body.comment;
   
	if(!beerId || !rating.toString().match(/^[1-5]$/g) || !comment.toString()){
		response.status(400);
		response.json({message: "Bad Request. Invalid parameter value"});
	} else {
		let beerObj;
		punkApi.getBeer(beerId).then(json => {
			const db = app.get('database');

			beerObj = json;
			db.insert({beerId: beerId, rating: rating, comment: comment});
			response.json({message: "Comments added.", rating: rating, comment: comment, beer: beerObj});
		});
		
   }
});

app.listen(8080);