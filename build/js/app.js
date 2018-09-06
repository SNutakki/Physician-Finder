(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
exports.apiKey = "16cbb39a641cdcea33285c51a6b03055"

},{}],2:[function(require,module,exports){
var apiKey = require("./../.env").apiKey;

function DoctorModule() {}

DoctorModule.prototype.getDoctors = function(
  medicalIssue,
  displayDoctors,
  sortOrder,
  doctorName,
  locName,
  resCount
) {
  $.get(
    "https://api.betterdoctor.com/2016-03-01/doctors?name=" +
      doctorName +
      "&query=" +
      medicalIssue +
      "&sort=" +
      sortOrder +
      "&location=" +
      locName +
      "&limit=" +
      resCount +
      "&user_key=" +
      apiKey
  )
    .then(function(response) {
      var doctorsArr = response.data;
      displayDoctors(doctorsArr);

      var Chicago = { lat: 41.850033, lng: -87.6500523 };
      var mapObject = new google.maps.Map(document.getElementById("map"), {
        zoom: 5,
        center: Chicago,
        mapTypeId: "terrain"
      });
      var firstResult = true;

      doctorsArr.forEach(function(doctor) {
        var practicesArr = [];
        doctor.practices.forEach(function(practice) {
          practicesArr.push(practice);
        });

        practicesArr.forEach(function(practice) {
          var address =
            practice.visit_address.street +
            " " +
            practice.visit_address.city +
            ", " +
            practice.visit_address.state +
            " " +
            practice.visit_address.zip;

          $.get(
            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
              address
          ).then(function(response) {
            console.log(response.results);
            var latitude = response.results[0].geometry.location.lat;
            var longitude = response.results[0].geometry.location.lng;
            var marker = new google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map: mapObject
            });
            if (firstResult) {
              mapObject.panTo({ lat: latitude, lng: longitude });
              firstResult = false;
            }
            // console.log(response.lat);
            // console.log(response.lng);
          });
        });
      });
    })
    .fail(function(error) {
      console.log("fail");
    });
};

// DoctorModule.prototype.createMap = function() {
//
// };

// DoctorModule.prototype.callGeocoder = function(address) {
//   $.get("http://maps.googleapis.com/maps/api/geocode/json?address=" + address)
//     .then(function(response) {
//
//       console.log(response.results);
//       var latitude = response.results[0].geometry.location.lat;
//       var longitude = response.results[0].geometry.location.lng;
//       var marker = new google.maps.Marker({
//         position: {lat: latitude, lng: longitude},
//         map: mapObject
//       });
//       // console.log(response.lat);
//       // console.log(response.lng);
//     });
// };

exports.doctorModule = DoctorModule;

},{"./../.env":1}],3:[function(require,module,exports){
var apiKey = require('./../.env').apiKey;
var DoctorModule = require('./../js/doctor.js').doctorModule;

function displayDoctors(doctorsArr) {
  $('#doctor-list').empty();
  if (doctorsArr.length === 0) {
    $('#doctor-list').append(
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

      doctor.practices.forEach(function(practice) {
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
      });
    });
  }
}

// function getPracticeLocations(doctorsArr) {
//   var practicesArr = [];
//   var practiceAddresses = [];
//   doctorsArr.forEach(function(doctor) {
//     doctor.practices.forEach(function(practice) {
//       practicesArr.push(practice);
//     });
//
//     practicesArr.forEach(function(practice) {
//       var address = practice.visit_address.street + " " +
//         practice.visit_address.city + ', ' +
//         practice.visit_address.state + " " +
//         practice.visit_address.zip;
//       practiceAddresses.push(address);
//     });
//   });
//   return practiceAddresses;
// }

$(document).ready(function() {
  var doctorModule = new DoctorModule();
  // doctorModule.createMap();
  $('#issue-form').submit(function(event) {
    event.preventDefault();

    var medicalIssue = $('#issue-input').val();
    var sortOrder = $('#sort-order').val();
    var doctorName = $('#doctor-name').val();
    var locName = $('#loc-name').val();
    var resCount = $('#res-count').val();
    doctorModule.getDoctors(medicalIssue, displayDoctors, sortOrder, doctorName, locName, resCount);
    $('#map').show();
  });
});

},{"./../.env":1,"./../js/doctor.js":2}]},{},[3]);
