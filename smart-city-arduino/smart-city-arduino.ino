// To Do
// - second servo
// - fix power
// - air quality sensor
// - street lighting (not enough power or bad wire connections?)
// - 

//For the neopixels
#include <Adafruit_NeoPixel.h>
#ifdef __AVR__
#include <avr/power.h>
#endif

//for the SGP30 Air quality sensor
#include <Wire.h>
#include "Adafruit_SGP30.h"

#include <Servo.h>

#define LDR_PIN                 0
#define MAG1_PIN                1
#define MAG2_PIN                2

#define BUTTON_1_PIN            8
#define BUTTON_2_PIN            9

#define SERVO1_PIN              7
#define SERVO2_PIN              6

#define LIGHTS_PIN              2

#define LIGHT_NEOPIXEL_PIN      10
#define LIGHT_PIXELS            14 // 12 for ring, 2 for indicators
#define C02_NEOPIXEL_PIN        11
#define C02_PIXELS              5 // 12 for ring, 2 for indicators


Adafruit_NeoPixel lightPixels = Adafruit_NeoPixel(LIGHT_PIXELS, LIGHT_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);
Adafruit_NeoPixel c02Pixels = Adafruit_NeoPixel(C02_PIXELS, C02_NEOPIXEL_PIN, NEO_GRB + NEO_KHZ800);

Adafruit_SGP30 sgp;

int lightReading = 0;
int light_mode = 0;
// 0 = auto
// 1 = on
// 2 = off
int railway_mode = 0;

int lastButton1 = 0;
int lastButton2 = 0;
int lastButton1Time = 1;
int lastButton2Time = 1;
int debounceDelay = 100;

Servo servo1;
Servo servo2;

int servo1Position = 0;
int servo2Position = 0;
unsigned long servoWait = 0;
unsigned long servoSensorSwitchWait = 0;


int magnetic1Reading = 0;
int magnetic2Reading = 0;

void setup() {
  Serial.begin(9600);

  // This initializes the NeoPixel library.
  lightPixels.begin();
  c02Pixels.begin();
  pinMode(BUTTON_1_PIN, INPUT_PULLUP);
  pinMode(BUTTON_2_PIN, INPUT_PULLUP);
  pinMode(LIGHTS_PIN, OUTPUT);              
  Serial.println("Connected the neopixels");

  // Connect to the air quality sensor
  // TODO: need to read & store a baseline for this sensor from the museum
  //  if (! sgp.begin()){
  //    Serial.println("Air quality Sensor not found");
  //    while (1);
  //  }
  //  Serial.print("Found SGP30 serial #");
  //  Serial.print(sgp.serialnumber[0], HEX);
  //  Serial.print(sgp.serialnumber[1], HEX);
  //  Serial.println(sgp.serialnumber[2], HEX);

  servo1.attach(SERVO1_PIN);
  servo2.attach(SERVO2_PIN);
  // mark servo pins as inputs to prevent shake
  pinMode(SERVO1_PIN, INPUT);
  pinMode(SERVO2_PIN, INPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  readButtons();
  readLDR();
  readMagneticSensors();
  //  readAirQuality();
  lightc02Display();
  lightLightDisplay();
  controlLights();
  controlCrossing();
  delay(50);
}

void lightc02Display() {
  for (int i = 0; i < C02_PIXELS; i++) {
    if (i < 0) {
      c02Pixels.setPixelColor(i, c02Pixels.Color(10 * lightReading, 10 * lightReading, 10 * lightReading)); // Moderately bright green color.
    } else {
      c02Pixels.setPixelColor(i, c02Pixels.Color(0, 0, 0)); // Moderately bright green color.
    }
    c02Pixels.show(); // This sends the updated pixel color to the hardware.
  }
}

void lightLightDisplay() {
  for (int i = 0; i < 12; i++) {
    if (i < lightReading) {
      lightPixels.setPixelColor(i, lightPixels.Color(5 * lightReading, 5 * lightReading, 5 * lightReading)); // Moderately bright green color.
    } else {
      lightPixels.setPixelColor(i, lightPixels.Color(0, 0, 0)); // Moderately bright green color.
    }
    lightPixels.show(); // This sends the updated pixel color to the hardware.
  }

  //  left control led for light mode
  if ( light_mode == 0) {
    lightPixels.setPixelColor(13, lightPixels.Color(0, 0, 100)); // blue for auto
  } else if (light_mode == 1) {
    lightPixels.setPixelColor(13, lightPixels.Color(0, 100, 0)); // green for on
  } else if (light_mode == 2) {
    lightPixels.setPixelColor(13, lightPixels.Color(100, 0, 00)); // red for on
  }

  //  right control led for railway mode
  if ( railway_mode == 0) {
    lightPixels.setPixelColor(12, lightPixels.Color(0, 0, 100)); // blue for auto
  } else if (railway_mode == 1) {
    lightPixels.setPixelColor(12, lightPixels.Color(0, 100, 0)); // green for on
  } else if (railway_mode == 2) {
    lightPixels.setPixelColor(12, lightPixels.Color(100, 0, 0)); // red for on
  }
}

void readButtons() {
  //  Buttons for controlling sensors
  int reading1 = digitalRead(BUTTON_1_PIN);
  int reading2 = digitalRead(BUTTON_2_PIN);

  if (reading1 == LOW && lastButton1 == HIGH) {
    light_mode += 1;
    if (light_mode == 3) {
      light_mode = 0;
    }
  }
  if (reading2 == LOW && lastButton2 == HIGH) {
    railway_mode += 1;
    if (railway_mode == 3) {
      railway_mode = 0;
    }
  }

  lastButton1 = reading1;
  lastButton2 = reading2;
}


void readLDR() {
  int lightValue = analogRead(LDR_PIN);
  lightReading = map(lightValue, 300, 900, 0, 11);
}

void readMagneticSensors() {
  int magnetic1Value = analogRead(MAG1_PIN);
  int magnetic2Value = analogRead(MAG2_PIN);
  magnetic1Reading = map(magnetic1Value, 0, 1023, 0, 100);
  magnetic2Reading = map(magnetic2Value, 0, 1023, 0, 100);
 // Serial.println(magnetic1Reading );
  Serial.println(magnetic2Reading );
}

void readAirQuality() {
  sgp.IAQmeasure();
  Serial.print("TVOC "); Serial.print(sgp.TVOC); Serial.print("\t");
  Serial.print("eCO2 "); Serial.println(sgp.eCO2);
}

void controlLights() {
  switch (light_mode) {
    case 0:
      // auto based on sensors
      if(lightReading < 4){
        digitalWrite(LIGHTS_PIN, HIGH);
      } else {
        digitalWrite(LIGHTS_PIN, LOW);
      }
      break;
    case 1:
      // on
      digitalWrite(LIGHTS_PIN, HIGH);
      break;
    case 2:
      // off
      digitalWrite(LIGHTS_PIN, LOW);
      break;
  }
}
void openCrossing(){
  if (servo1Position != 1) {
    Serial.println("move servos to open");
    pinMode(SERVO1_PIN, OUTPUT);
    pinMode(SERVO2_PIN, OUTPUT);
    servo1Position = 1;
    servo1.write(140);
    servo2.write(170);
    servoWait = millis();
  }
}

void closeCrossing(){
  if (servo1Position != 2) {
    Serial.println("move servos to closed");
    pinMode(SERVO1_PIN, OUTPUT);
    pinMode(SERVO2_PIN, OUTPUT);
    servo1Position = 2;
    servo1.write(50);
    servo2.write(80);
    servoWait = millis();
  }
}

void controlCrossing() {
  // TODO: control railway crossing servos based on magnetic sensors or mode
  switch (railway_mode) {
    case 0:
        if((magnetic1Reading < 50 && servoSensorSwitchWait + 500 < millis()) || (magnetic2Reading > 50 && servoSensorSwitchWait + 500 < millis()) ) {
          // toggle crossing          
          if (servo1Position == 1){
            closeCrossing();
          } else {
            openCrossing();
          }
          servoSensorSwitchWait = millis();
        }
      break;
    case 1:
      openCrossing();
      break;
    case 2:
      closeCrossing();
      break;
  }

  // hack for stabilising servos by turning their pins to input after 1 second  
  if ( servoWait != 0 && ((servoWait + 1000) < millis()) ){
    servoWait = 0;
    Serial.println("reset servos");
    pinMode(SERVO1_PIN, INPUT);
    pinMode(SERVO2_PIN, INPUT);
  }
}

void showAirQuality() {
  //  TODO: write out co2 level to neopixel row
}


