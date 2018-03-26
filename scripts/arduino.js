'use strict';

// Object oriented library for controlling an arduino running the 
//   StandardFirmataPlus
const five = require('johnny-five');
const  pixel = require("node-pixel");
const  death = require("death");


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
const colorLevel = [
  '#000000',
  '#440000',
  '#880000',
  '#bb0000',
  '#ff0000',
  '#ff4400',
  '#ff8800',
  '#ffbb00',
  '#ffff00',
  '#ffff44',
  '#ffff88',
  '#ffffbb',
  '#ffffff'
]
const onHighBrightness = function() {
  // console.log('brightness is high! Turn off lights');
}
const onLowBrightness = function() {
  // console.log('brightness is low! Turn on lights');
}
const lightSensorCallback = function() {
  let lightLevel = Math.floor(this.level * 12)
  console.log(lightLevel)
  if(this.level > lightThreshold.high){
    onHighBrightness();
  } else if (this.level < lightThreshold.low){
    onLowBrightness();
  }
  let currentColor = colorLevel[lightLevel]
  // show level in the neopixel led ring 
  for(let i = 1; i < 12; i++){

    if (i < lightLevel)
      strip.pixel(i).color(currentColor);
    else
      strip.pixel(i).off();
    strip.show()
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
// NeoPIxel LED ring
///////////////////////////////////////////////////////////////////////////////

let strip = null
let stripAnimation = null




///////////////////////////////////////////////////////////////////////////////
// Initialize sensors
///////////////////////////////////////////////////////////////////////////////

arduino.on('ready', function(){
  // sample all reads twice per second
  this.samplingInterval(500);
  // initialize two hall effect sensors
  new five.Sensor('A1').on('change', onHallEffectSensorTrigger);
  new five.Sensor('A2').on('change', onHallEffectSensorTrigger);
  servo = new five.Servo(servoConfig);

  let button2 = new five.Button(2);
  button2.on("hold", function() {
    console.log( "Button 2 held" );
  });

  let button3 = new five.Button(3);
  button3.on("hold", function() {
    console.log( "Button 3 held" );
  });

  let button4 = new five.Button(4);
  button4.on("hold", function() {
    console.log( "Button 4 held" );
  });

  let button5 = new five.Button(5);
  button5.on("hold", function() {
    console.log( "Button 5 held" );
  });

  // Neopixel circle
  strip = new pixel.Strip({
      board: this,
      controller: "FIRMATA",
      strips: [ {pin: 6, length: 12}, ], // this is preferred form for definition
      gamma: 2.8, // set to a gamma that works nicely for WS2812
  });
  // 
  strip.on("ready", function() {
    strip.pixel(0).color("#ff0000");
    strip.show()
    // while starting up, show a looping animation for two seconds
    stripAnimation = setInterval( () => {
      strip.shift( 1, pixel.FORWARD, true );
      strip.show();
    }, 50)  
  });
  // after 3 seconds, attach the ldr sensor and set it to modifying the strip
  //  depending on value
  setTimeout(() => {
    clearInterval(stripAnimation)  
    strip.off()
    setTimeout(() => {
      new five.Light('A0').on('change', lightSensorCallback);
    }, 500)
  }, 3000)
});




// when the process exits, return everything to defaults, turn off leds etc.
death((signal, err) => {
  console.log('turning smart-city off')

  if(strip)
    strip.off();
  if(stripAnimation)
    clearInterval(stripAnimation)
});


// TODO: will we be exporting anything???
module.exports = null;
