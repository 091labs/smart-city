'use strict';

// load libraries
const express = require("express");
const app = express();

// load scripts for controlling RP GPIO & arduino
const GPIO = require('./scripts/gpio.js');
const Arduino = require('./scripts/arduino.js');

// configure the callbacks for what happens when the brightness changes
Arduino.onHighBrightness = function(){
  GPIO.turnLightsOff();
}
Arduino.onLowBrightness = function(){
  GPIO.turnLightsOn();
}

// Simple API for toggling the lights via get requests to urls:
//  GET /lights/on : turn lights on
//  GET /lights/off : turn lights off
app.get("/lights/:value", function(req, res){
	let value = req.params.value;
	if(value == 'on'){
    GPIO.turnLightsOn();
		res.send("Lights have been turned on!");
	} else if(value == 'off') {
    GPIO.turnLightsOff();
		res.send("Lights have been turned OFF!");
	} else {
		console.log("unknown command ", value);
		res.send("Unknown command!\nDon't know how to turn lights " + value);
	}
});

console.log("listening on port 3000")
app.listen(3000);

