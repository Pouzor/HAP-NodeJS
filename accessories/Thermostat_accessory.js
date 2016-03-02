// HomeKit types required
var types = require("./types.js")
var exports = module.exports = {};
var http = require('http');
var config = require('../config');
var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;


var MY_SENSOR = {
  currentTemperature: 5,
  getTemperature: function() {
    return MY_SENSOR.currentTemperature;
  },
  requestTemperature: function() {


	var options = {
		host: config.host,
		port: config.port,
		path: '/api/temperature',
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
            console.log(parsed.temp);
           MY_SENSOR.currentTemperature = parsed.temp;
        });
	}).on("error", function(e){
		console.log("Got error: " + e.message);
	});
  }
};

MY_SENSOR.requestTemperature();


var sensorUUID = uuid.generate('hap-nodejs:accessories:termo');

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake lock.
var sensor = exports.accessory = new Accessory('Termostats', sensorUUID);

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "CA:3E:BC:4D:5E:FF";
sensor.pincode = "031-45-154";

// Add the actual TemperatureSensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.Thermostat)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
	var temp = parseFloat(MY_SENSOR.getTemperature());
    callback(null, temp);
});
sensor
  .getService(Service.Thermostat)
  .getCharacteristic(Characteristic.TargetHeatingCoolingState)
  .on('get', function(callback) {
    callback(null, 0);
});
sensor
  .getService(Service.Thermostat)
  .getCharacteristic(Characteristic.CurrentHeatingCoolingState)
  .on('get', function(callback) {
    callback(null, 0);
});   
sensor
  .getService(Service.Thermostat)
  .getCharacteristic(Characteristic.TargetTemperature)
  .on('get', function(callback) {
    callback(null, 20);
});     
sensor
  .getService(Service.Thermostat)
  .getCharacteristic(Characteristic.TemperatureDisplayUnits)
  .on('get', function(callback) {
    callback(null, "celsius");
});     
sensor
  .getService(Service.Thermostat)
  .getCharacteristic(Characteristic.CurrentRelativeHumidity)
  .on('get', function(callback) {
    callback(null, 55);
}); 


 setInterval(function() {
  
  MY_SENSOR.requestTemperature();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.Thermostat)
    .setCharacteristic(Characteristic.CurrentTemperature, MY_SENSOR.currentTemperature);
  
}, 60000);