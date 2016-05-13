/**
 * FILL THESE
 */
 var USERNAME = "GD Bot" // Bot username in the channel
 var OWNER = 112303371980976128 //User ID of owner. Get by typing \@username
 
 var welcomeMessage = "Startup" //Welcome message (not working yet)
 
 var commandPrefix = "~" //prefix for the commands
 
var DiscordClient = require('discord.io'); //require discord API
var fs = require('fs');
PNG = require('pngjs').PNG;
var helptxt = fs.readFileSync("./help.txt", "utf8");


var bot = new DiscordClient({ //create new discord bot
    autorun: true,
    token: ""
});

bot.on('ready', function () {
    console.log(bot.username + " - (" + bot.id + ")");
	BotSay("180316469974794241", welcomeMessage);
	//invert(255,255,0,0,255,0)
});

bot.on('message', function (user, userID, channelID, message, rawEvent) {
	
	 if ( (message[0] == commandPrefix) ) {  //Command messages

		message = message.substr(1); //removes prefix

		if ((message.substring(0, 5) ==  "draw ") ) {    //if message contains keyword at beginning.
			
			message = message.substr(5); //removes 4 letters which are the command
			
			var typename = message.split(" ")[0] //type name. Ball, icon etc..
			var imagename = message.split(" ")[1] //image name 1 2 3 etc..
			var col0 = parseFloat(message.split(" ")[2]) //split string and make in to decimals
			var col1 = parseFloat(message.split(" ")[3]) //RGB value 0 - 255
			var col2 = parseFloat(message.split(" ")[4])
			var col3 = parseFloat(message.split(" ")[5])
			var col4 = parseFloat(message.split(" ")[6])
			var col5 = parseFloat(message.split(" ")[7])
			
			
			fs.stat("icons/"+typename+"/"+imagename+".png", function(err, stats) { if(!err && stats.isFile()) { //checks if file exists
				
				if (col0 < 0 || col0 > 255 || col1 < 0 || col1 > 255 || col2 < 0 || col2 > 255 || col3 < 0 || col3 > 255 || col4 < 0 || col4 > 255 || col5 < 0 || col5 > 255 ) { //error if RGB ranges are weird
					BotSay(channelID, "ERROR RGB values can only range from `0` to `255`")
				} else {
					var newimage = "icons/"+typename+'/'+imagename+".png" //create image dir to pass down
					colorImage(newimage,col0,col1,col2,col3,col4,col5,channelID); //send data to colorImage
					console.log("ImageColor: "+col0+col1+col2+col3+col4+col5+" "+newimage); //log
				};
				
			} else { //if image does not exist error out
				BotSay(channelID, "ERROR type or icon name does not exist")
			}
			});
			
		} else if ((message.substring(0, 4) ==  "help") ) {
				BotSay(userID, helptxt)
		};
	};
});


//primary color variables
var primaryR = 175 
var primaryG = 175
var primaryB = 175
var primaryFlux = 61
//secondary color variables
var secondaryR = 255
var secondaryG = 255
var secondaryB = 255
var secondaryFlux = 180

function colorImage(iconimage,RX,GX,BX,RY,GY,BY,chID) { //recieve inputs
	
	fs.createReadStream(iconimage) //create a read stream for the file passed down
	.pipe(new PNG({
		filterType: 4
	}))
	.on('parsed', function() {

    for (var y = 0; y < this.height; y++) {
        for (var x = 0; x < this.width; x++) {
            var idx = (this.width * y + x) << 2;
			
            // invert color
            //this.data[idx] = 255 - this.data[idx];
            //this.data[idx+1] = 255 - this.data[idx+1];
            //this.data[idx+2] = 255 - this.data[idx+2];
			
			//check if pixel is between certain ranges. If yes execute code
			if ( (this.data[idx] >= primaryFlux && this.data[idx] <= primaryR) && (this.data[idx+1] >= primaryFlux && this.data[idx+1] <= primaryG) && (this.data[idx+2] >= primaryFlux && this.data[idx+2] <= primaryB) ) {
							
							this.data[idx] = RX/(primaryR/this.data[idx]);
				            this.data[idx+1] = GX/(primaryG/this.data[idx+1]); //calculation to fix shading
							this.data[idx+2] = BX/(primaryB/this.data[idx+2]);
							
			//check if pixel is between certain ranges. If yes execute code
			}else if ( ( this.data[idx] >= secondaryFlux && this.data[idx] <= secondaryR) && (this.data[idx+1] >= secondaryFlux && this.data[idx+1] <= secondaryG) && (this.data[idx+2] >= secondaryFlux && this.data[idx+2] <= secondaryB)) {
							
							this.data[idx] = RY/(secondaryR/this.data[idx]);
				            this.data[idx+1] = GY/(secondaryG/this.data[idx+1]); //0 - 40
							this.data[idx+2] = BY/(secondaryB/this.data[idx+2]);
			};

            // and reduce opacity
            //this.data[idx+3] = this.data[idx+3] >> 1
			
        }
    }
		var outputfile = Math.random().toString(36).substr(2, 5) + ".png" //create a random name for the output file
		this.pack().pipe(fs.createWriteStream('out/' + outputfile)); //make it a png with that name
		
		setTimeout(function(){ //wait a few seconds until it finishes coloring and then upload
			BotUpload(chID, outputfile, function(){
				fs.unlink("out/" + outputfile, function(){})
			})
		},5000); 
		
	});

};

// Bot response function
function BotSay(chID, ms) {
    bot.sendMessage({
		to: chID,
        message: ms
    });
	
	console.log(USERNAME + "> " + ms)
};

//Upload image function
function BotUpload(chID, file, callback) {
    bot.uploadFile({
        to: chID,
        file: "out/" + file,
        filename: "GDICON.png", //File will be uploaded to Discord
}, function(){
      callback()
});
};