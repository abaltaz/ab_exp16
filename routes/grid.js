var express = require('express');
var router = express.Router();
var request = require('request');

//var insta;

function insta(callback) {

	request('https://api.instagram.com/v1/tags/lollapalooza/media/recent?client_id=00cd82b16c0847b4be2074eaf7ab4a68&callback=?', function (error, response, body) {
	  if (!error && response.statusCode == 200) {
		  var feed = JSON.parse(body)
		  callback(feed);
	    //console.log(body) // Show the HTML for the Google homepage. 
	  }
	})

}

router.get('/', function(req, res, next) {
	insta(function(data) {
		res.render('grid', { link: data.data[0].link });
	});
});

module.exports = router;
