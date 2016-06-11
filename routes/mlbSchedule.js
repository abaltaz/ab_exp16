var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var underscore = require('underscore');
var parseString = require('xml2js').parseString;
var Converter = require("csvtojson").Converter;
var converter = new Converter({});
var Promise = require('promise');


function doRequest(endpoint, endpointFormat){
	return new Promise(function(resolve,reject) {
		request(endpoint, function(error, response, body) {
			console.log("Request made to " + endpoint);
			
			if (!error && response.statusCode == 200) {
			
				if (endpointFormat === "json") {
					resolve(JSON.parse(body));
				}
				else if (endpointFormat === "xml") {
					resolve(body);
				}
			}
			
			else {
				resolve(Error);
			}
			
		});
	});
}

var cubsSchedule = "http://mlb.mlb.com/ticketing-client/csv/EventTicketPromotionPrice.tiksrv?team_id=112&home_team_id=112&display_in=singlegame&ticket_category=Tickets&site_section=Default&sub_category=Default&leave_empty_games=true&event_type=T&event_type=Y"


function getSchedule(endpoint) {
	return new Promise(function(resolve,reject){

		require("request").get(endpoint).pipe(converter);

		converter.on("end_parsed", function (schedule) {
			resolve(schedule); //here is your result json object 
		});

	});
}

getSchedule(cubsSchedule).then(function(schedule){

	console.log("mlb", schedule[0]["END DATE"]);

});
 

