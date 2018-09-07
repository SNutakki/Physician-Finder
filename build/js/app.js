(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
exports.apiKey = "16cbb39a641cdcea33285c51a6b03055"

},{}],2:[function(require,module,exports){
var apiKey = require("./../.env").apiKey;

function DoctorModule() {}

//Main function responsible for retrieving doctor info and handling it or delegating it to be handled
DoctorModule.prototype.getDoctors = function(
    mapObject,
  medicalIssue,
  displayDoctors,
  sortOrder,
  doctorName,
  city,
  state,
  resCount
) {
    if (!(city !== "" && state === "")) {
        var location = "";
        if (city !== "" && state !== "") {
            location = state.toLowerCase() + "-" + city.replace(/\s/g,'-').toLowerCase();
        } else if (state !== "") {
            location = state.toLowerCase();
        }
        console.log(location);
        $.get(
            "https://api.betterdoctor.com/2016-03-01/doctors?name=" +
            doctorName +
            "&query=" +
            medicalIssue +
            "&sort=" +
            sortOrder +
            "&location=" +
            location +
            "&limit=" +
            resCount +
            "&user_key=" +
            apiKey
        )
            .then(function (response) {
                var doctorsArr = response.data;
                displayDoctors(doctorsArr);
                var markerLookup = [];

                doctorsArr.forEach(function (doctor) {

                    doctor.practices.forEach(function (practice) {
                        console.log(doctor.profile.first_name);
                        var addressForMap =
                            practice.visit_address.street +
                            "<br>" +
                            practice.visit_address.city +
                            ", " +
                            practice.visit_address.state +
                            " " +
                            practice.visit_address.zip;
                        var address = addressForMap.replace("<br>", " ");

                        //converts address into lat/long coordinates
                        $.get(
                            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                            address
                        ).then(function (response) {
                            console.log(response.results);
                            var latitude = response.results[0].geometry.location.lat;
                            var longitude = response.results[0].geometry.location.lng;

                            var prevZoom = mapObject.zoom;

                            //if a doctor is already present at an address, the marker info box
                            //needs to be updated instead of replaced
                            var locFreeVal = isLocationNotFree(markerLookup, [latitude, longitude]);
                            if (locFreeVal === -1) {
                                var marker = new google.maps.Marker({
                                    position: {lat: latitude, lng: longitude},
                                    map: mapObject
                                });
                                markerLookup.push([latitude, longitude]);
                                var markClkdAgn = false;

                                //marker info box message
                                var infoContent = '<div id = "info' + (markerLookup.length - 1) + '"> <h5 id = "popup">' +
                                    doctor.profile.first_name + " " +
                                    doctor.profile.last_name + '</h5>' + '<p id="popup">' +
                                    addressForMap + '</p>' + '</div>';

                                console.log("Displaying infoContent:" + infoContent);

                                var info = new google.maps.InfoWindow({
                                    content: infoContent
                                });

                                marker.addListener('mouseover', function () {
                                    info.open(map, marker);
                                });

                                marker.addListener('mouseout', function () {
                                    info.close(map, marker);
                                });

                                marker.addListener('click', function () {
                                    mapObject.panTo({lat: latitude, lng: longitude});
                                });

                                marker.addListener('dblclick', function () {
                                    mapObject.panTo({lat: latitude, lng: longitude});
                                    if (mapObject.zoom < 17) {
                                        prevZoom = mapObject.zoom;
                                        mapObject.setZoom(17);
                                    }
                                    if (markClkdAgn && mapObject.zoom >= 17) {
                                        mapObject.setZoom(prevZoom);
                                    }
                                    markClkdAgn = !markClkdAgn; //used to handle multiple double clicks on marker
                                });
                            } else {

                                //updates marker when necessary instead of overwriting
                                var checkExist = setInterval(function() {
                                    if (document.getElementById('info0')) {
                                        var infoToEdit = document.getElementById('info0');
                                        console.log("Displaying infoToEdit:" + infoToEdit.toString());
                                        var textToEdit = infoToEdit.getElementsByTagName("h5")[0].innerHTML;
                                        if (!textToEdit.includes(doctor.profile.first_name + " " + doctor.profile.last_name)) {
                                            infoToEdit.getElementsByTagName("h5")[0].innerHTML += ",<br>" +
                                                doctor.profile.first_name + " " + doctor.profile.last_name;
                                        }
                                        clearInterval(checkExist);
                                    }
                                }, 50);
                            }

                            //initially displayed marker is first
                            if (practice === doctorsArr[0].practices[0]) {
                                mapObject.panTo({lat: latitude, lng: longitude});
                                mapObject.setZoom(5);
                            }
                        });
                    });
                });
            })
            .fail(function (error) {
                $('#doctor-list').empty();
                $('#error-msg').empty().append(
                    '<div class="well">' +
                    '<h3>' +
                    'Your search has failed. Please check your inputs.' +
                    '</h3>' +
                    '</div>'
                );
                return false;
            });
            return true;
    } else {
        $('#doctor-list').empty();
        $('#error-msg').empty().append(
            '<div class="well">' +
            '<h3>' +
            'Your must specify the state if you specify a city.' +
            '</h3>' +
            '</div>'
        );
        return false;
    }
};


function isLocationNotFree(lookup, search) {
    for (var i = 0, l = lookup.length; i < l; i++) {
        if (lookup[i][0] === search[0] && lookup[i][1] === search[1]) {
            return i;
        }
    }
    return -1;
}

exports.doctorModule = DoctorModule;

},{"./../.env":1}],3:[function(require,module,exports){
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

},{"./../.env":1,"./../js/doctor.js":2}]},{},[3]);
