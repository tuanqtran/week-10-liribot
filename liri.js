// Set variables for npm packages.
var inquirer = require("inquirer");
var Twitter = require('twitter');
var keys = require("./keys.js");
var spotify = require('spotify');
var request = require('request');
var fs = require('fs'); 
var twitter = new Twitter(keys);

// Tweets 20 of the user most recent tweets and calls the logText function which appends the content to a text file.
function myTweets(){
	var params = {screen_name: 'Tuan_QTran', count: 20};
	twitter.get(
		'statuses/user_timeline',
		params,
		function(error, tweets, response) {
  		if (error) {
    		console.log(error);
  		}else{
  			tweets.forEach(function(tweet){
	  			var tweetOutput = "Tweet: " + tweet.text + "\n" +
	  				"Published: " + tweet.created_at + "\n";
	  			// console.log(tweetOutput);
	  			logText(tweetOutput);
  			})
  		}
  		// Reenable the start prompt until the user exits the app.
  		start();
	});
}

// Pastes the Artist name, song name, link and album name and calls the logText function which appends the content to a text file.
function chosenSpotify(userSpotInput){
	spotify.search({
		type: 'track',
		query: userSpotInput
	}, function(err, userSpotInput) {
	    if (err) {
	        console.log('Error occurred: ' + err);
	        return;
	    }else{
	    	var userSI = userSpotInput.tracks.items[0];
	  		var spotifyOutput = "Artist: " + userSI.artists[0].name + "\n" +
	  			"Song Name: " + userSI.name + "\n" +
	  			"Spot Link: " + userSI.external_urls.spotify + "\n" +
	  			"Album: " + userSI.album.name + "\n";
	  		// console.log(spotifyOutput);
	  		logText(spotifyOutput);			
	    }
	    // Reenable the start prompt until the user exits the app.
	    start();
	});
}

// Pastes the movie data to the user and calls the logText function which appends the content to a text file.
function chosenMovie(userMovieInput){
	request(`http://www.omdbapi.com/?t=${userMovieInput}&y=&i=&plot=short&tomatoes=true&r=json`, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			var parseUserInput = JSON.parse(body)
	  		var movieOutput = "Movie Title: " + parseUserInput.Title + "\n" +
	  			"Year Release: " + parseUserInput.Year + "\n" +
	  			"Country Produced: " + parseUserInput.Country + "\n" +
	  			"Language: " + parseUserInput.Language + "\n" +
	  			"Plot: " + parseUserInput.Plot + "\n" +
	  			"Actors: " + parseUserInput.Actors + "\n" +
	  			"IMBD Rating: " + parseUserInput.imdbRating + "\n" +
	  			"Rotten Tomatoes Rating: " + parseUserInput.tomatoRating + "\n" +
	  			"Rotten Tomatoes URL: " + parseUserInput.tomatoURL + "\n";
	  		// console.log(movieOutput);
	  		logText(movieOutput);
		}
		// Reenable the start prompt until the user exits the app.
		start();
	});
}

// Access the random.txt file content and Spotify the results.
function randomChoice(){
	fs.readFile("random.txt", 'utf8', function(error, data) {		    
		// If the code experiences any errors it will log the error to the console. 
	    if(error) {
	        return console.log(error);
	    }else{
	    	var dataArr = data.split(",");
	    	var userFirstInput = dataArr[0];
	    	var userSecondInput = dataArr[1];

	    	switch(userFirstInput){
	    		case "spotify-this-song":
	    			chosenSpotify(userSecondInput);
	    			break;
	    	}
	    }
	}); 		
}

// Appends all the file to log.txt
function logText(data){
	console.log(data);
	fs.appendFile("./log.txt", data + "\n", function(err){
		if(err){
			console.log('Error occurred: ' + err);
		}
	});
}

// Start function which provides the user a series of choices.
function start(){
	inquirer.prompt([
		{
			type: "list",
			name: "whatToPick",
			message: "Which one would you like to check out?",
			choices: ["My Twitter", "Spotify", "Movies", "Random", "Exit"] 
		}
	]).then(function(user) {
		if (user.whatToPick == "My Twitter"){
			myTweets();
		}else if (user.whatToPick == "Spotify"){
			inquirer.prompt([
				{
					type: "input",
					name: "songChoice",
					message: "What song would you like to check out?",
				}
			]).then(function(userSpotInput){
				if (userSpotInput.songChoice == ""){
					chosenSpotify("Ace of Base")
				}else{
					chosenSpotify(userSpotInput.songChoice);	
				}
			})
		}else if (user.whatToPick == "Movies"){
			inquirer.prompt([
				{
					type: "input",
					name: "movieChoice",
					message: "What movie would you like to check out?",
				}
			]).then(function(userMovieInput){
				if (userMovieInput.movieChoice == ""){
					chosenMovie("Mr. Nobody")
				}else{
					chosenMovie(userMovieInput.movieChoice);
				}

			})		
		}else if (user.whatToPick == "Random"){
			randomChoice();		
		}else if (user.whatToPick == "Exit"){
			inquirer.prompt([
				{
					type: "confirm",
					name: "exitApp",
					message: "Are you sure you want to leave?",
				}
			]).then(function(leave){
				if (leave.exitApp == true){
					console.log("Bye!");
				}else{
					start();
				}

			})	
		}
	})
}

start();