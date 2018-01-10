# Smart-City 

The smart lego city at the Insight Computer & Communications museum is being 
controlled by this node script running on a RP2 rev.B

It provides a basic web API for controlling it, interfaces with the lights via
GPIO pins and a light sensor via an arduino using StandardFirmataPlus.

It is currently running on the Pi automatically on startup via `/etc/rc.local`

##TODO

- Document the wiring
- Document the code in `/etc/rc.local`
- Save read luminosity to a file, with a rotation to keep them from getting too big, or a simple DB
- Discuss and add more features. Current ideas include:
  - Hall effect sensors and magnets to get the trains position, count labs etc.
  - Solar panels to power lights
  - Traffic lights
  - Train road barrier via servo and a sensor to find the trains location.
