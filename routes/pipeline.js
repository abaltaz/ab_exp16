var express = require('express');
var router = express.Router();
var request = require('request');
var GoogleSpreadsheet = require("google-spreadsheet");

var parseString = require('xml2js').parseString;



// spreadsheet key is the long id in the sheets URL 
var my_sheet = new GoogleSpreadsheet('10QSareQIrulAhBMZy3bWTvNMyMRmzbE3KzTjB9qVzBg');

// Without auth -- read only 
// IMPORTANT: See note below on how to make a sheet public-readable! 
// # is worksheet id - IDs start at 1 

var pipeline = {
	definition: [],
	backlog: [],
	inprogress: [],
	qat: [],
	inproduction: []
};

function convertToSlug(Text)
{
    return Text
        .toLowerCase()
        .replace(/[^\w ]+/g,'')
        .replace(/ +/g,'-')
        ;
}

function getUpdate() {
	
		pipeline = {
			definition: [],
			backlog: [],
			inprogress: [],
			qat: [],
			inproduction: []
		};

		my_sheet.getRows( 1, function(err, row_data){
			
			//console.log( 'pulled in ' + JSON.stringify(row_data) + ' rows');
	
			for (i=0; i<row_data.length; i++) {
	
				parseString(row_data[i]._xml, function(err, result) {
					//console.log(result.entry.title[0]);
					//console.log(result.entry);
										
					
					//DEFINITION
					if (result.entry["gsx:status"][0] === "Definition" ||
						result.entry["gsx:status"][0] === "Discovery" ||
						result.entry["gsx:status"][0] === "Groomed") {
						
						pipeline.definition.push({
							title: result.entry["gsx:project"][0],
							status: result.entry["gsx:status"][0],
							statusSlug: convertToSlug(result.entry["gsx:status"][0]),
							priority: result.entry["gsx:mscw"][0].toLowerCase(),
							size: result.entry["gsx:size"][0],
							category: result.entry["gsx:category"][0]
						});
					}
					
					
					//READY FOR DEVELOPMENT
					if (result.entry["gsx:status"][0] === "Ready for development" ||
						result.entry["gsx:status"][0] === "Assigned") {
						pipeline.backlog.push({
							title: result.entry["gsx:project"][0],
							status: result.entry["gsx:status"][0],
							statusSlug: convertToSlug(result.entry["gsx:status"][0]),
							priority: result.entry["gsx:mscw"][0].toLowerCase(),
							size: result.entry["gsx:size"][0],
							category: result.entry["gsx:category"][0]
						});
					}
					
					//IN PROGRESS
					if (result.entry["gsx:status"][0] === "In progress" ||
						result.entry["gsx:status"][0] === "Code Review") {
						
						pipeline.inprogress.push({
							title: result.entry["gsx:project"][0],
							status: result.entry["gsx:status"][0],
							statusSlug: convertToSlug(result.entry["gsx:status"][0]),
							priority: result.entry["gsx:mscw"][0].toLowerCase(),
							size: result.entry["gsx:size"][0],
							category: result.entry["gsx:category"][0]
						});
					}
					
					//TESTING
					if (result.entry["gsx:status"][0] === "QAT" ||
						result.entry["gsx:status"][0] === "UAT" ||
						result.entry["gsx:status"][0] === "Ready for production" || 
						result.entry["gsx:status"][0] === "Ready for Prod") {
						
						pipeline.qat.push({
							title: result.entry["gsx:project"][0],
							status: result.entry["gsx:status"][0],
							statusSlug: convertToSlug(result.entry["gsx:status"][0]),
							priority: result.entry["gsx:mscw"][0].toLowerCase(),
							size: result.entry["gsx:size"][0],
							category: result.entry["gsx:category"][0]
						});
					}
					
					//IN PRODUCTION
					if (result.entry["gsx:status"][0] === "In production") {
						
						pipeline.inproduction.push({
							title: result.entry["gsx:project"][0],
							status: result.entry["gsx:status"][0],
							statusSlug: convertToSlug(result.entry["gsx:status"][0]),
							priority: result.entry["gsx:mscw"][0].toLowerCase(),
							size: result.entry["gsx:size"][0],
							category: result.entry["gsx:category"][0]
						});
					}
								
			
				});
			}
		
		});
		
		
	setTimeout(getUpdate,15000);
		
}

getUpdate();

router.get('/', function(req, res, next) {
	console.log("ppt4", pipeline);
	res.render('pipeline', pipeline);
});


module.exports = router;

/*

router.get('/', function(req, res, next) {
	res.render('updates', {
		
	});
});
*/