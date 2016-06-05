var express = require('express');
var router = express.Router();
var request = require('request');
var GoogleSpreadsheet = require("google-spreadsheet");
var MarkdownDeep = require('markdowndeep');
var moment = require('moment');
var firebase = require("firebase");

var parseString = require('xml2js').parseString;



// spreadsheet key is the long id in the sheets URL 
var my_sheet = new GoogleSpreadsheet('1aJWLYrdhSE-y5PbrXRNxj5jgorz0ajYTpLABVP-eLYE');

// Without auth -- read only 
// IMPORTANT: See note below on how to make a sheet public-readable! 
// # is worksheet id - IDs start at 1 

var mdd = new MarkdownDeep.Markdown();
mdd.ExtraMode = true;
mdd.SafeMode = false;

//Firebase init
firebase.initializeApp({
  serviceAccount: "./exp16-cf8620f22772.json",
  databaseURL: "https://project-8614330592105978928.firebaseio.com"
});

var db = firebase.database();
var ref = db.ref("server/c1/posts");
//var updatesRef = ref.child("updates");

/*
// As an admin, the app has access to read and write all data, regardless of Security Rules
var db = firebase.database();
var ref = db.ref("restricted_access/secret_document");
ref.once("value", function(snapshot) {
  console.log("db1", snapshot.val());
});
*/

var updatesArray;
var settings;
var forecast;
var firebasePosts;

function getFirebasePosts(callback) {
	ref.on('value', function(snapshot){
		
		var posts = snapshot.val()
		
		console.log("New Data");
		
		var x;
		
		var postsArray = [];
		
		//console.log(posts);
		
		for (x in posts) {
			
			posts[x]["key"] = x;
			
			postsArray.push(posts[x]);
			
			//console.log(posts[x].update);
			
		}
		
		callback(postsArray.reverse());
		
	});
}

getFirebasePosts(function(data){
	firebasePosts = data;
});

function getUpdate() {

	newUpdatesArray = [];
	newSettingsArray = [];

		my_sheet.getRows( 1, function(err, row_data){
			
			//console.log( 'pulled in ' + JSON.stringify(row_data) + ' rows');
	
			for (i=0; i<row_data.length; i++) {
	
				parseString(row_data[i]._xml, function(err, result) {
					//console.log(result.entry.title[0]);
					//console.log(result);
					
					if (result.entry["gsx:updates"][0] !== "") {
						//console.log('gsx updates', result.entry["gsx:updates"]);
						newUpdatesArray[i] = {
							updates: result.entry["gsx:updates"],
							source: result.entry["gsx:source"],
							image: result.entry["gsx:image"],
							timestamp: result.entry["gsx:time"],
							layout: result.entry["gsx:layout"]
						};
						
						/*
						updatesRef.push({
							updates: result.entry["gsx:updates"],
							source: result.entry["gsx:source"],
							image: result.entry["gsx:image"],
							timestamp: result.entry["gsx:time"],
							layout: result.entry["gsx:layout"]
						});
						*/
						
						
						//console.log("test1", newUpdatesArray[i].updates);
						newUpdatesArray[i].updates = mdd.Transform(newUpdatesArray[i].updates[0]);
						
						if (newUpdatesArray[i].layout[0]) {
							newUpdatesArray[i].layout = convertToSlug(newUpdatesArray[i].layout[0]);
							console.log(newUpdatesArray[i].layout);
						}
						
						else {
							newUpdatesArray[i].layout = "standard";
						}
						
						
						
					}
				
			
				});
			}
	
			updatesArray = newUpdatesArray.reverse();
	
			//console.log(updatesArray);
			
		
		});
		
		my_sheet.getRows( 2, function(err, row_data_settings){
			//console.log(JSON.stringify(row_data_settings));
			
			for (i=0; i<row_data_settings.length; i++) {

				parseString(row_data_settings[i]._xml, function(err, result) {
					//console.log(result.entry.title[0]);
					//console.log(result);
				

						//console.log('gsx updates', result.entry["gsx:updates"]);
						newSettingsArray[i] = {
							updatenow: result.entry["gsx:updatenow"],
							date: result.entry["gsx:date"],
							backgroundimage: result.entry["gsx:backgroundimage"],
						};
					
			
		
				});
			}
			
			//console.log(newSettingsArray);
			settings = newSettingsArray;
			
			
		});
		
		
		
	request('https://api.forecast.io/forecast/783d0532d2e2a62cd4fea9df27df5414/41.8369,-87.6847', function(error, response, body) {
		if (!error && response.statusCode == 200) {
			var word = "test";
			var data = JSON.parse(body);
			forecast = {
				tempNow : Math.round(data.currently.temperature),
				tempHigh : Math.round(data.daily.data[0].temperatureMax),
				conditionHour : data.minutely.summary.replace(/\.$/g,"")
			}
		}
	});			
		
	setTimeout(getUpdate,600000);
		
}

getUpdate();


router.get('/', function(req, res, next) {
	//console.log(updatesArray);
	console.log("HEY");
	res.render('updates', { 
		updates: updatesArray,
		forecast: forecast,
		settings: settings,
		fbasePosts: firebasePosts
	});
});


module.exports = router;

function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

/*

router.get('/', function(req, res, next) {
	res.render('updates', {
		
	});
});
*/