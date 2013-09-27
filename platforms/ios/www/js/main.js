// David Jones
// AVF 1309
// Demo App

var pictureSource;   
var destinationType;

//Event listener for deviceready
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
		$("#insta").on("pageinit", displayInstaPics);
		$("#weather").on("pageinit", displayWeather);
		pictureSource = navigator.camera.PictureSourceType;
        destinationType = navigator.camera.DestinationType;
        $("#geolocate").on("pageinit", displayLocation);
        $("#saveContact").on("click", saveContact);
        $("#weatherByLoc").on("pageinit", weatherLoad);
        $("#mapByLoc").on("pageinit", getLocForMap);
}; // phonegap deviceready

// Function to get pictures from Instagram API
var displayInstaPics = function(){
	var instaUrl = "https://api.instagram.com/v1/tags/hiking/media/recent?callback=?&amp;client_id=5972228563da4106aa1323119426f70a";
	
	$.getJSON(instaUrl, function(instagramData){
		console.log(instagramData);
		
		$.each(instagramData.data, function(index, picture){	
			var pics = "<li class='imgLi'><img src='" + picture.images.thumbnail.url + "' alt='" +
				picture.user.id + "' />";
			$("#dataOut").append(pics);		
		});
	}); //End of JSON call
}; //End of instagram feature

// Function to get weather data from API
var displayWeather = function(){	
	$.ajax({
		url : "http://api.wunderground.com/api/ffab5ab328f6d817/geolookup/conditions/q/AR/Beebe.json",
		dataType : "jsonp",
		success : function(parsed_json) {
			var location = parsed_json['location']['city'];
			var temp_f = parsed_json['current_observation']['temp_f'];
			
			$("#currentWeather").empty();
			var currentWeather = $(
			 "<li>Location: " + location + "</li>" +
			 "<li>Temperature: " + temp_f + "</li>"
			);
			
			$("#currentWeather").append(currentWeather);
			
			//alert("Current temperature in " + location + " is: " + temp_f);
		}
	});	//End of ajax call
}; //End of weather api feature


/* Camera Feature 
   Takes a picture and displays it on screen
   Ability to take and do simple edit as well	
*/

var captureSuccessful = function(imgData) {
	var preview = document.getElementById('preview');
    preview.style.display = 'block';
    preview.style.marginLeft = 'auto';
    preview.style.marginRight = 'auto';
    preview.src = "data:image/jpeg;base64," + imgData;
    var viewData = document.getElementById('viewData');
    viewData.style.display = "block";
    viewData.style.marginLeft = "auto";
    viewData.style.marginRight = "auto";
    $("#viewData").innerHTML = imgData;
};

// Capture the photograph with device camera
var takePic = function() {
    navigator.camera.getPicture(captureSuccessful, noJoy, { quality: 100,
    	destinationType: destinationType.DATA_URL });
};

// Capture an editable photo with device camera
var shootAndCrop = function() {
    navigator.camera.getPicture(captureSuccessful, noJoy, { quality: 100, allowEdit: true,
        destinationType: destinationType.DATA_URL });
};

// If camera fails for some reason
var noJoy = function(errMessage) {
    alert('Failed due to: ' + errMessage);
};

// End of Camera Feature


/* Geolocation Native Feature
	Gathers current geolocation data
	Displays it on screen
*/    
// Function to gather current geolocation data
var displayLocation = function(){
	navigator.geolocation.getCurrentPosition(onGoodLocation, onBadLocation);
};

// Sends location data to paragraph within list item on page.
var onGoodLocation = function(position) {
        var element = document.getElementById('geolocation');
        element.innerHTML = 'Latitude: '           + position.coords.latitude              + '<br />' +
                            'Longitude: '          + position.coords.longitude             + '<br />' +
                            'Altitude: '           + position.coords.altitude              + '<br />' +
                            'Timestamp: '          + position.timestamp                    + '<br />';
}; //End of success function for geolocation

// If something goes wrong.
var onBadLocation = function(error) {
	alert('code: '    + error.code    + '\n' +
    	'message: ' + error.message + '\n');
}; //End of failure function for geolocation

// End of Geolocation Feature

//Notification Features
//Vibrate won't work on iPad (no vibrate on iPad), works on an iPhone

var visualAlert = function() {
        navigator.notification.alert(
            "This is a notification message!",
            notGood,          
            "Your Name Here",                 
            "Adios Muchacho" //Name of the button
        );
    };
    
var notGood = function(){
	alert("Something went wrong!");
};

// Beep three times
var sounds = function() {
    navigator.notification.beep(3);
};

/*
// Vibrate for 2 seconds
var shakes = function() {
    navigator.notification.vibrate(2000);
};
*/
// End of Notification Features

// Contact Features
var saveContact = function(){
	var newContact = navigator.contacts.create();
	newContact.displayName = $("#firstName").val();
	newContact.nickname = $("#firstName").val();
	newContact.notes = $("#notes").val();
	
	var conName = new ContactName();
	conName.givenName = $("#firstName").val();
	conName.familyName = $("#lastName").val();
	newContact.name = conName;
	
	//Creates a new contact field for phone number
	var phoneNums = [];
	phoneNums[0] = new ContactField('mobile', $("#phoneNumber").val(), true);
	newContact.phoneNumbers = phoneNums;
	
	//Creates a new contact field for email
	var email = [];
	email[0] = new ContactField('home', $("#email").val(), true);
	newContact.emails = email;
	
	//Save contact to device
	newContact.save(onGoodSave, onBadSave);
};

//On Successful Save
var onGoodSave = function(newContact){
	alert("Save Success");
};

//On Failed Save
var onBadSave = function(conError){
	alert("Error = " + conError.code);
};

//////////////
//Runs my Weather API and Displays by Getting Users GeoLocation then using Ajax Calls finds local code for location and then displays information/radar
var weatherLoad = function(){
	navigator.geolocation.getCurrentPosition(weatherByLoc, onGeoFailure);
};

var weatherByLoc = function(currentLocation){

	var latitude = currentLocation.coords.latitude; 
	var longitude = currentLocation.coords.longitude;

	$.ajax({

		url: "http://api.wunderground.com/api/5e635afafbd17b86/geolookup/q/" + latitude + "," + longitude + ".json",
		dataType: "jsonp",
		success: function(localWeatherData){

			var nearbyStation = localWeatherData.location.l;

			var localData = "http://api.wunderground.com/api/5e635afafbd17b86/conditions" + nearbyStation + ".json";
			var radar = "http://api.wunderground.com/api/5e635afafbd17b86/animatedradar" + nearbyStation + ".gif?radius=100&width=400&height=400&rainsnow=1&newmaps=1";

			$.ajax({

				url: localData,
				dataType: "jsonp",
				success: function(weatherData){
					var mainHeading = $(
						"<li>" + weatherData.current_observation.display_location.full +
						"<p>" + weatherData.current_observation.observation_time + "<p></li>"
					);
					
					var temperatureSection = $(
						"<li><h1>" + weatherData.current_observation.temp_f + "</h1>" +
						"<h2>" + weatherData.current_observation.weather + "</h2>" +
						"<h4>Feels Like: " + weatherData.current_observation.feelslike_string + " | " + "Heat Index: " + weatherData.current_observation.heat_index_string + "</h4></li>"
					);
					
			/*		
					var localVariables = $(
						"<div class='ui-block-a><div class='ui-bar ui-bar-e'>Wind: " + weatherData.current_observation.wind_string + "</div></div>" +
						"<div class='ui-block-b><div class='ui-bar ui-bar-e'>Humidity: " + weatherData.current_observation.relative_humidity + "</div></div>" +
						"<div class='ui-block-a><div class='ui-bar ui-bar-e'>UV Index: " + weatherData.current_observation.UV + "</div></div>" +
						"<div class='ui-block-b><div class='ui-bar ui-bar-e'>Visibility: " + weatherData.current_observation.visibility_mi + "</div></div>" +
						"<div class='ui-block-a><div class='ui-bar ui-bar-e'>Dew Point: " + weatherData.current_observation.dewpoint_string + "</div></div>" +
						"<div class='ui-block-b><div class='ui-bar ui-bar-e'>Pressure: " + weatherData.current_observation.pressure_in + "</div></div>"
					);
			*/		
					var wind = document.getElementById('wind');
					wind.innerHTML = "Wind: " + weatherData.current_observation.wind_string;
					
					var humidity = document.getElementById('humidity');
					humidity.innerHTML = "Humidity: " + weatherData.current_observation.relative_humidity;
					
					var uv = document.getElementById('uv');
					uv.innerHTML = "UV: " + weatherData.current_observation.UV;
					
					var vis = document.getElementById('visibility');
					vis.innerHTML = "Visibility: " + weatherData.current_observation.visibility_mi + " miles.";
					
					var dew = document.getElementById('dewpoint');
					dew.innerHTML = "Dew Point: " + weatherData.current_observation.dewpoint_string;
					
					var pressure = document.getElementById('pressure');
					pressure.innerHTML = "Pressure: " + weatherData.current_observation.pressure_in;
					
					var radarImg = $(
						"<li><img src=" + radar + "/></li>"
					);

					$("#weatherMain").append(mainHeading);
					$("#tempMain").append(temperatureSection);
			//		$("#localVars").append(localVariables);
					$("#radarImage").append(radarImg);
				}
			});

		}
	});

};

var onGeoFailure = function (){

	alert("Current Location Not Found.");

};

///// Map by Geolocation

var getLocForMap = function(){
	navigator.geolocation.getCurrentPosition(mapByLoc, onGeoFailure);	
};

var mapByLoc = function(currentLocation){
	var mapLat = currentLocation.coords.latitude; 
	var mapLon = currentLocation.coords.longitude;
	
	var center = mapLat + "," + mapLon;
	
	var localMap = '<img src="http://maps.google.com/maps/api/staticmap?center=' + center + '&zoom=11&size=600x800&markers=color:red|31.4211,35.1144&sensor=false">"';
	
	$("#map").append(localMap);	
};

/*
var getLocForMap = function(){
	navigator.geolocation.getCurrentPosition(mapByLoc, onGeoFailure);
};

var mapByLoc = function(){
	var mapLat = currentLocation.coords.latitude; 
	var mapLon = currentLocation.coords.longitude;
	
	var localMap = $(
		"<li><img src='http://maps.googleapis.com/maps/api/staticmap" +
			"?center=" + mapLat + "," + mapLon + 
			"&zoom=12" +
			"&size=400x400" +
			"&maptype=hybrid" +
			"&markers=color:red|31.4211,35.1144" +
			"&sensor=false'" + 
			" /></li>"
	);
	$("#map").append(localMap);	
};
*/