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
        $("#saveContact").on("click", saveContact); //Calls for the Contacts Function
     
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
