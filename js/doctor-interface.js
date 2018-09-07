var apiKey = require('./../.env').apiKey;
var DoctorModule = require('./../js/doctor.js').doctorModule;

//Displays a list of doctors after a search is performed
function displayDoctors(doctorsArr) {
    $('#error-msg').empty();
  $('#doctor-list').empty();
  if (doctorsArr.length === 0) {
    $('#error-msg').append(
      '<div class="well">' +
      '<h3>' +
      'Your search has returned no results.' +
      '</h3>' +
      '</div>'
    );
  } else {
    doctorsArr.forEach(function(doctor) {
      var specialties = '';
      var practices = '';
      var title = '';

      //check if specialty/address info exists
      if (doctor.specialties[0] !== undefined) {
        specialties = ' (' + doctor.specialties[0].name + ')';
      }
      if (doctor.practices !== undefined && doctor.practices.length > 0) {
        console.log(doctor.uid.toString());
        practices = '<h4> Practice Locations:</h4>' +
            '<div id="practices-' + doctor.uid +'">' + '</div>';
      }

      if (doctor.profile.title !== undefined) {
        title = ", " +
            doctor.profile.title;
      }
      $('#doctor-list').append(
        '<div class="well">' +
          '<div class="row">' +
            '<div class="col-md-6">' +
              '<h3>' +
                doctor.profile.first_name + " " + doctor.profile.last_name + title +
              specialties + '</h3>' +
              practices +
            '</div>' +
            '<div class="col-md-6">' +
              // '<div id="map">' +
              // '</div>' +
            '</div>' +
          '</div>' +
        '</div>'
      );

      //Appends addresses for ll doctors
      doctor.practices.forEach(function(practice) {
        if (!($('#practices-' + doctor.uid + ':contains(' + practice.name + ')').length > 0)) {
            $('#practices-' + doctor.uid).append(
                practice.name +
                '<ul>' +
                '<li>' +
                practice.visit_address.street + '<br>' +
                practice.visit_address.city + ', ' +
                practice.visit_address.state + " " +
                practice.visit_address.zip +
                '</li>' +
                '</ul>'
            );
        }
      });
    });
  }
}

//Runs upon index.html being initially loaded
$(document).ready(function() {
  var doctorModule = new DoctorModule();
    //Map created with Kansas City at Center
    var kansCity = {lat: 39.015697, lng: -94.565559};
    var mapObject = new google.maps.Map(document.getElementById("map"), {
        zoom: 4,
        center: kansCity
    });
  $('#issue-form').submit(function(event) {
    event.preventDefault();
    var medicalIssue = $('#issue-input').val();
    var sortOrder = $('#sort-order').val();
    var doctorName = $('#doctor-name').val();
    var city = $('#city').val();
    var state = $('#state').val();
    var resCount = $('#res-count').val();
    var result = doctorModule.getDoctors(mapObject, medicalIssue, displayDoctors,
        sortOrder, doctorName, city, state, resCount);
    console.log(result);
  });
});
