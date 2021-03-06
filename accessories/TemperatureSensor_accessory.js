var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var http = require('http');
var config = require('../config');

var MY_SENSOR = {
  currentTemperature: 1,
  getTemperature: function() {
    return MY_SENSOR.currentTemperature;
  },
  requestTemperature: function() {


	var options = {
		host: config.host,
		port: config.port,
		path: '/api/home',
                headers: {
                  'Authorization': 'Basic ' + new Buffer(config.auth.username + ':' + config.auth.password).toString('base64')
                }  
	};

	http.get(options, function(resp){
		var body = '';
		resp.on('data', function(chunk){
			body += chunk;
		});
		resp.on('end', function() {
            // Data reception is done, do whatever with it!
           var parsed = JSON.parse(body);
           MY_SENSOR.currentTemperature = parsed.temperature;
        });
	}).on("error", function(e){
		console.log("Got error: " + e.message);
	});
  }
};

MY_SENSOR.requestTemperature();

// Generate a consistent UUID for our Temperature Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor".
var sensorUUID = uuid.generate('hap-nodejs:accessories:temperature-sensor');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Temperature Sensor', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
	var temp = parseFloat(MY_SENSOR.getTemperature());
    callback(null, temp);
  });

// randomize our temperature reading every 3 seconds
setInterval(function() {
  
  MY_SENSOR.requestTemperature();
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, MY_SENSOR.currentTemperature);
  
}, 60000);