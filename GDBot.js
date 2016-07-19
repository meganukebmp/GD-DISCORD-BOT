///////////////////////////////////////////////////////////////////// INITIALIZATION /////////////////////////////////////////////////////////

//requires
var fs = require('fs'); // filesystem
PNG = require('pngjs').PNG; // require pngjs for image edit
var express = require('express'); // require express API for network stuffs
var app = express(); // creates new express app instance
var Discord = require("discord.js"); // require the discord API

var config = fs.readFileSync("./config.txt", "utf8").split("\r\n"); // loads configuration file and splits it in to an array each line
var helpText = fs.readFileSync("./help.txt", "utf8"); // help text from file
var availableObjects = JSON.parse( config[4].replace("types:", "") ); // parses object data from string
var availableColors = JSON.parse( fs.readFileSync("./colors.txt", "utf8") ); //read color object data from string.

//storage values
var USERNAME = config[1].replace("username:", ""); // takes username from config
var OWNER = config[2].replace("owner:", "").replace(/ /g, ""); // takes owner ID from config
var PREFIX = config[3].replace("prefix:", "").replace(/ /g, ""); // takes prefix from config

var bot = new Discord.Client(); //creates new bot instance
var port = process.env.PORT || 8080; // assign port. if no port given use localhost

initExpress(); // initializes express port listening
bot.loginWithToken(config[0].replace("token:", "").replace(/ /g, "")); // authenticates to discord using token from the config array

// when the bot is ready.
bot.on("ready", function() {
    console.log(bot.user.username + " logged in succesfully!")
    console.log("Finished!");
	bot.setUsername( USERNAME ); // changes username
	bot.setPlayingGame( "Nexrem / meganukebmp" ); // changes playing text
});

/////////////////////////////////////////////////////////// RUNTIME ////////////////////////////////////////////////

// on each message
bot.on("message", function(message) {

    // if message starts with prefix
    if (message.content.substring(0, PREFIX.length) == PREFIX) {

        message.content = message.content.substr(PREFIX.length); // removes prefix from message

        // if command is found
        if (message.content.substring(0, 5) == "draw ") {
			
			message.content = message.content.replace("cube", "icon").replace("dart", "wave"); // some people say cube instead of icon and dart instead of wave.
            var drawParameters = message.content.substr(5).split(" "); // split command in to array and remove "draw"
			var params = parseCommand( drawParameters, message ) // sends to parser function and gets returned an array
			
			// checks if returned file exists. If not error out.
			fs.access( params[0], function(err) {
				// if file does not exist
				if (err) {
					sendMessage( message.channel, "**ERR:** File or type does not exist")
				}
				// if it does
				else {
					// checks if color values are within range. If out of range error out. Else continue.
					if ( params[1] < 0 || params[1] > 255 || params[2] < 0 || params[2] > 255 || params[3] < 0 || params[3] > 255 || params[4] < 0 || params[4] > 255 || params[5] < 0 || params[5] > 255 || params[6] < 0 || params[6] > 255 ) {
						sendMessage( message.channel, "RGB color **MUST** be between `0` and `255` !" );
					}
					else {
						// sends command to drawer function with parsed data. Since parsed data is returned in array form we use arrays for this.
						colorImage( params[0], params[1], params[2], params[3], params[4], params[5], params[6], message.channel );
						//sendMessage( message.channel, params[0] + " " + params[1] + " " + params[2] + " " + params[3] + " " + params[4] + " " + params[5] + " " + params[6] );
					};
				};
			});
        }
        // help command. PM's user help text.
        else if (message.content == "help") {
            sendMessage(message.author, helpText) // PM's user the help text
            sendMessage(message.channel, message.author.mention() + " check your PM's :envelope:") // tells user to check their PM's
        };
    };
});


//////////////////////////////////////////////////////
// primary color variables
var primaryR = 175
var primaryG = 175
var primaryB = 175
var primaryFlux = 61
// secondary color variables
var secondaryR = 255
var secondaryG = 255
var secondaryB = 255
var secondaryFlux = 180

function colorImage(iconimage, RX, GX, BX, RY, GY, BY, chID) {

    fs.createReadStream(iconimage) // create a read stream for the file passed down
        .pipe(new PNG({
            filterType: 4
        }))
        .on('parsed', function() {

            for (var y = 0; y < this.height; y++) {
                for (var x = 0; x < this.width; x++) {
                    var idx = (this.width * y + x) << 2;

                    // check if pixel is between certain ranges. If yes execute code
                    if ((this.data[idx] >= primaryFlux && this.data[idx] <= primaryR) && (this.data[idx + 1] >= primaryFlux && this.data[idx + 1] <= primaryG) && (this.data[idx + 2] >= primaryFlux && this.data[idx + 2] <= primaryB)) {

                        this.data[idx] = RX / (primaryR / this.data[idx]);
                        this.data[idx + 1] = GX / (primaryG / this.data[idx + 1]); // calculation to fix shading
                        this.data[idx + 2] = BX / (primaryB / this.data[idx + 2]);

                        // check if pixel is between certain ranges. If yes execute code
                    } else if ((this.data[idx] >= secondaryFlux && this.data[idx] <= secondaryR) && (this.data[idx + 1] >= secondaryFlux && this.data[idx + 1] <= secondaryG) && (this.data[idx + 2] >= secondaryFlux && this.data[idx + 2] <= secondaryB)) {

                        this.data[idx] = RY / (secondaryR / this.data[idx]);
                        this.data[idx + 1] = GY / (secondaryG / this.data[idx + 1]); // 0 - 40
                        this.data[idx + 2] = BY / (secondaryB / this.data[idx + 2]);
                    };

                };
            };
            var outputfile = Math.random().toString(36).substr(2, 5) + ".png" // create a random name for the output file
			
			// opens a write stream piping the recolored data in to it. When done executes the callback.
            this.pack().pipe( fs.createWriteStream('out/' + outputfile) ).on("finish", function() { 
				// uploads file and then deletes it locally
				bot.sendFile( chID, "./out/" +outputfile, outputfile, function() {
					 fs.unlink("out/" + outputfile);
				});
			});
        });
};

//////////////////////////////////////////////////////////////////MISC////////////////////////////////////////////////////////////////


// Express lib is used to respond to the heroku server and prevent from automatic close
function initExpress() {

    //listen on port.
    app.listen(port, function() {
        console.log('Our app is running on http://localhost:' + port); // respond on port
    });

    app.use(express.static(__dirname + '/public')); // to be able to use static content in /public directory. Such as HTML files and etc.
};

// sends a message to channel
function sendMessage(channelID, msg) {
    bot.sendMessage(channelID, msg);
};

/////////////////////////////////////////////////////////////// COMMAND PARSER /////////////////////////////////////////////////

// parses command and returns propper values
function parseCommand( parameters, message ) {
	
	var TYPE = parameters[0]; // type variable
	var iconID; // iconID
	
	var colortype; // storage value for color type.
	
	// primary
	var col1;
	var col2;
	var col3;
	// secondary
	var col4;
	var col5;
	var col6;
	
	// if we're doing a random icon.
	if ( TYPE == "random" ) {
		
		// check if we're doing full random or semi-random. Where full random doesn't care about type and semi-random narrows down to type.
		if ( parameters[1] != null ) {
			
			// semi-random code
			var typeArray = Object.keys( availableObjects ); // gets all object keys from the object and add to array
			
			// check if selected type exists in randomizer allowed. If not do nothing.
			if ( typeArray.indexOf( parameters[1] ) > -1 ) {
				
				TYPE = parameters[1]
				iconID = Math.floor(Math.random() * availableObjects[TYPE] ) + 1 // select random value from the selected item acceptable values
				// takes random RGB values
				col1 = Math.floor(Math.random() * 255 )
				col2 = Math.floor(Math.random() * 255 )
				col3 = Math.floor(Math.random() * 255 )
				col4 = Math.floor(Math.random() * 255 )
				col5 = Math.floor(Math.random() * 255 )
				col6 = Math.floor(Math.random() * 255 )
			};
		}
		else {
			// full random code
			var typeArray = Object.keys( availableObjects ); // gets all object keys from the object and add to array
			TYPE = typeArray[ Math.floor(Math.random() * typeArray.length) ] // take random item from created array
			iconID = Math.floor(Math.random() * availableObjects[TYPE] ) + 1 // select random value from the selected item acceptable values
			// takes random RGB values
			col1 = Math.floor(Math.random() * 255 )
			col2 = Math.floor(Math.random() * 255 )
			col3 = Math.floor(Math.random() * 255 )
			col4 = Math.floor(Math.random() * 255 )
			col5 = Math.floor(Math.random() * 255 )
			col6 = Math.floor(Math.random() * 255 )
		};
	}
	else {
		// when we're on manual mode.
		TYPE = parameters[0]; // manual type set
		iconID = parameters[1]; // manual ID set
		
		//////////// color parsing ///////////
		
		// check if color values are not blank.
		if ( parameters[2] != null ) {
			
			// check if hex
			if ( parameters[2].substring(0,1) == "#" ) {
				
				// parse hex
				// converts HEX values to RGB
				parameters[2] = parameters[2].replace("#", ""); //removes # from hex strings
				
				// if the second parameter does not exist set it to black. If it DOES exist use that.
				if ( parameters[3] != null ) {
					parameters[3] = parameters[3].replace("#", "");
				}
				else (
					parameters[3] = "000000" // 000000 is hex for black
				);
				
				// primary colors
				col1 = parseInt( parameters[2].substring(0,2),16 ); //converts a hex value in to a dec integer. only the first 2 characters [RED]
				col2 = parseInt( parameters[2].substring(2,4),16 ); //converts a hex value in to a dec integer. only the second 2 characters [GREEN]
				col3 = parseInt( parameters[2].substring(4,6),16 ); //converts a hex value in to a dec integer. only the last 2 characters [BLUE]
				// secondary colors
				col4 = parseInt( parameters[3].substring(0,2),16 ); //converts a hex value in to a dec integer. only the first 2 characters [RED]
				col5 = parseInt( parameters[3].substring(2,4),16 ); //converts a hex value in to a dec integer. only the second 2 characters [GREEN]
				col6 = parseInt( parameters[3].substring(4,6),16 ); //converts a hex value in to a dec integer. only the last 2 characters [BLUE]
				
			}
			// check if literal color using word. By checking if it exists in a list.
			else if ( Object.keys( availableColors ).indexOf( parameters[2] ) > -1 ) {
				// parse literals
				
				var literalColor1 = availableColors[ parameters[2] ] // takes matching color object from object
				
				// checks if second color exists. If not uses black. If it does uses that
				if ( Object.keys( availableColors ).indexOf( parameters[3] ) > -1 ) {
					var literalColor2 = availableColors[ parameters[3] ]
				}
				else {
					var literalColor2 = [0,0,0] // black
				};
				
				// takes values from returned from object array.
				// primary colors
				col1 = parseInt( literalColor1[0] );
				col2 = parseInt( literalColor1[1] );
				col3 = parseInt( literalColor1[2] );
				// secondary colors
				col4 = parseInt( literalColor2[0] );
				col5 = parseInt( literalColor2[1] );
				col6 = parseInt( literalColor2[2] );
				
			}
			// else we assume it's RGB
			else {
				col1 = parseInt( parameters[2] ) // bind all color parameters to integer's of the string
				col2 = parseInt( parameters[3] )
				col3 = parseInt( parameters[4] )
				col4 = parseInt( parameters[5] )
				col5 = parseInt( parameters[6] )
				col6 = parseInt( parameters[7] )
			};
		} 
		// if color values are blank suppy random colors.
		else {
			col1 = Math.floor(Math.random() * 255 )
			col2 = Math.floor(Math.random() * 255 )
			col3 = Math.floor(Math.random() * 255 )
			col4 = Math.floor(Math.random() * 255 )
			col5 = Math.floor(Math.random() * 255 )
			col6 = Math.floor(Math.random() * 255 )
		};
	};
	
	// fix NaN and undefined and other false values. Otherwise RGB value check will fail.
	col1 = col1 || 0
	col2 = col2 || 0
	col3 = col3 || 0
	col4 = col4 || 0
	col5 = col5 || 0
	col6 = col6 || 0
	
	return [ "./icons/" + TYPE + "/" + iconID + ".png", col1, col2, col3, col4, col5, col6, colortype ] // returns all values in an array
};