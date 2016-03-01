// HomeKit types required
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var types = require("./types.js")
var exports = module.exports = {};
var http = require('http');
var config = require('../config');

var execute = function(accessory,characteristic,value){ console.log("executed accessory: " + accessory + ", and characteristic: " + characteristic + ", with value: " +  value + "."); }

var MY_SENSOR = {
  currentTemperature: 0,
  currentHumidity: 0,
};

var sensor = exports.accessory = {
  displayName: "Thermostat 1",
  username: "CA:3E:BC:4D:5E:FF",
  pincode: "031-45-154",
  services: [{
    sType: types.ACCESSORY_INFORMATION_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Thermostat 1",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Bla",
      designedMaxLength: 255    
    },{
      cType: types.MANUFACTURER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Oltica",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Bla",
      designedMaxLength: 255    
    },{
      cType: types.MODEL_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Rev-1",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Bla",
      designedMaxLength: 255    
    },{
      cType: types.SERIAL_NUMBER_CTYPE, 
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "A1S2NASF88EW",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Bla",
      designedMaxLength: 255    
    },{
      cType: types.IDENTIFY_CTYPE, 
      onUpdate: null,
      perms: ["pw"],
      format: "bool",
      initialValue: false,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Identify Accessory",
      designedMaxLength: 1    
    }]
  },{
    sType: types.THERMOSTAT_STYPE, 
    characteristics: [{
      cType: types.NAME_CTYPE,
      onUpdate: null,
      perms: ["pr"],
      format: "string",
      initialValue: "Thermostat Control",
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Bla",
      designedMaxLength: 255   
    },{
      cType: types.CURRENTHEATINGCOOLING_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Current HC", value); },
      perms: ["pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Mode",
      designedMaxLength: 1,
      designedMinValue: 0,
      designedMaxValue: 2,
      designedMinStep: 1,    
    },{
      cType: types.TARGETHEATINGCOOLING_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Target HC", value); },
      perms: ["pw","pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Mode",
      designedMinValue: 0,
      designedMaxValue: 3,
      designedMinStep: 1,
    },{
      cType: types.CURRENT_TEMPERATURE_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Current Temperature", value); },
      perms: ["pr","ev"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Current Temperature",
      unit: "celsius"
    },{
      cType: types.TARGET_TEMPERATURE_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Target Temperature", value); },
      perms: ["pw","pr","ev"],
      format: "int",
      initialValue: 20,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Target Temperature",
      designedMinValue: 16,
      designedMaxValue: 38,
      designedMinStep: 1,
      unit: "celsius"
    },{
      cType: types.TEMPERATURE_UNITS_CTYPE,
      onUpdate: function(value) { console.log("Change:",value); execute("Thermostat", "Unit", value); },
      perms: ["pr","ev"],
      format: "int",
      initialValue: 0,
      supportEvents: false,
      supportBonjour: false,
      manfDescription: "Unit"
    }]
  }]
}

  function requestTemperature() {


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

setInterval(function() {
  
  requestTemperature();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, MY_SENSOR.currentTemperature);
  
}, 5000);


