'use strict';

// Object oriented library for controlling an arduino running the 
//   StandardFirmataPlus
const five = require('johnny-five');


class Arduino {
  constructor(){
    super();
    // Connect to the arduino on the port it's connected to, and turn of the 
    //   interactive console
    this.board = five.Board({
      port: '/dev/ttyUSB0',
      repl: false
    });
    // use a low and high threshold to prevent flickering when the value is 
    //  close to the threshold
    this.threshold = {
      low: 0.45,
      high: 0.55
    }
    this.board.on('ready', function(){
      // sample all reads twice per second
      this.samplingInterval(500);
      
      this._configurePhotoResistor();
    });

  }

  // this is a placeholder callback which needs to be set to tell the arduino 
  //   what to do when the brightness rises above the high threshold
  onHighBrightness (){
    return null;
  }

  // this is a placeholder callback which needs to be set to tell the arduino 
  //   what to do when the brightness falls below the low threshold
  onLowBrightness (){
    return null;
  }

  // private methods prefixed with _

  // initialize photoresistor and toggle lights on off when it falls below the 
  //   threshold.
  _configurePhotoResistor(){
    // need a local reference to the current scope for the change listener
    let arduino = this;
    // photo resistor is connected on pin A0
    this.photoResistor = new five.Light('A0');
      photoResistor.on('change', function(){
        if(this.level > arduino.threshold.high){
          arduino.onHighBrightness();
        } else if (this.level < arduino.threshold.log){
          arduino.onLowBrightness();
        }
      });
  }
}
// initialize connection to arduino
var board = five.Board({
	port: '/dev/ttyUSB0',
	repl: false
});

// threshold for when the leds should turn on / off
// lights off, only ambeint lighting (monitors etc.) is around 0.18
// lights on gives a reading around 0.75
var threshold = 0.5;

board.on('ready', function(){
	// sample all reads twice per second
	this.samplingInterval(500);
	// initialize photoresistor amd toggle lights on off when it falls below the threshold.
	var photoResistor = new five.Light('A0');
	photoResistor.on('change', function(){
		console.log("light level: " + this.level)
		if(this.level > threshold){
			toggleLights(rpio.LOW);
		} else {
			toggleLights(rpio.HIGH);
		}
	});
});


// API to toggle lights
app.get("/lights/:value", function(req, res){
	var value = req.params.value;

	if(value == 'on'){
		console.log("Toggle Lights ON");
		toggleLights(rpio.HIGH)
		res.send("Lights have been turned on!");
	} else if(value == 'off') {
		console.log("Toggle Lights OFF");
		toggleLights(rpio.LOW)
		res.send("Lights have been turned OFF!");
	} else {
		console.log("unknown command ", value);
		res.send("Unknown command!\nDon't know how to turn lights " + value);
	}
});

console.log("listening on port 3000")
app.listen(3000);

