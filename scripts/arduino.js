'use strict';

// Object oriented library for controlling an arduino running the 
//   StandardFirmataPlus
const five = require('johnny-five');

///////////////////////////////////////////////////////////////////////////////
// arduino
///////////////////////////////////////////////////////////////////////////////

// Connect to the arduino on the port it's connected to, and turn of the 
//   interactive console
const arduino = five.Board({
  port: '/dev/ttyUSB0',
  repl: false
});

///////////////////////////////////////////////////////////////////////////////
// light sensor
///////////////////////////////////////////////////////////////////////////////

// use a low and high threshold to prevent flickering when the value is 
//  close to the threshold
const lightThreshold = {
  low: 0.45,
  high: 0.55
}
const onHighBrightness = function() {
  // console.log('brightness is high! Turn off lights');
}
const onLowBrightness = function() {
  // console.log('brightness is low! Turn on lights');
}
const lightSensorCallback = function() {
  if(this.level > lightThreshold.high){
    onHighBrightness();
  } else if (this.level < lightThreshold.low){
    onLowBrightness();
  }
}

///////////////////////////////////////////////////////////////////////////////
// Servo
///////////////////////////////////////////////////////////////////////////////

let moveBarrierDown = false;
let servo = null
const servoConfig = {
  pin: 10,
  startAt: 0,
  range: [0,90]
};

///////////////////////////////////////////////////////////////////////////////
// Hall effect sensors
///////////////////////////////////////////////////////////////////////////////

const hallEffectThreshold = {
  low: 500,
  high: 520
}
const onHallEffectSensorTrigger = function(){
  console.log('sensor - ', this.value)
  if(this.value > hallEffectThreshold.high || 
     this.value < hallEffectThreshold.low){
    // console.log('a hall effect sensor was triggered');

    // toggle the barrier (ie. servo)
    moveBarrierDown = !moveBarrierDown
    if(moveBarrierDown){
      servo.to(90, 1000);
    } else {
      servo.to(0, 1000);
    }
    // console.log('moveBarrierDown?', moveBarrierDown)
  }
}





///////////////////////////////////////////////////////////////////////////////
// Initialize sensors
///////////////////////////////////////////////////////////////////////////////

arduino.on('ready', function(){
  // sample all reads twice per second
  this.samplingInterval(500);
  // initialize LDR and toggle lights on off when brightness falls below the 
  //   threshold.
  new five.Light('A0').on('change', lightSensorCallback);
  // initialize two hall effect sensors
  new five.Sensor('A1').on('change', onHallEffectSensorTrigger);
  new five.Sensor('A2').on('change', onHallEffectSensorTrigger);
  servo = new five.Servo(servoConfig);
});

// TODO: will we be exporting anything???
module.exports = null;