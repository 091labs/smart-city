'use strict';

const rpio = require("rpio");

// this is a singleton class which is responsible for all GPIO related actions
class GPIO {
  constructor(){
    super()
    // streetlight GPIOXX pin numbers
    this.streetLights = [12,13,16,19,20,21,26];
    // use the GPIOXX mapping instead of physical pinout
    rpio.init({ mapping: 'gpio' });
    this._configureLights();
    // save the current state of the lights in case it needs to be queried later
    this.streetLightsState = rpio.LOW;
  }

  // Toggle the lights on / off depending on passed value (rpio.LOW or 
  //   rpio.HIGH)
  toggleLights(value){
    for(var i=0;i< this.streetLights.length;i++){
      rpio.write(this.streetLights[i], value);
    }  
    this.streetLightsState = value;
  }

  // shortcut method to turn all lights on
  turnLightsOn(){
    this.toggleLights(rpio.HIGH);
  }

  // shortcut method to turn all lights off
  turnLightsOff(){
    this.toggleLights(rpio.Low);
  }


  // private methods prefixed with _

  // Set rpio to access pins by their GPIOXX number, and set them all to output
  //   initialize rp gpio pins as outputs
  _configureLights(){
    for(var i = 0; i < this.streetLights.length;i++){
      // Set each GPIO pin used for the streetlights as an output which defaults 
      //   to low (OV)
      rpio.open(this.streetLights[i], rpio.OUTPUT, rpio.LOW);
    }
  }
}

module.exports = new GPIO;