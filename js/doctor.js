var apiKey = require("./../.env").apiKey;

function DoctorModule() {}

DoctorModule.prototype.getDoctors = function(
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

                var Chicago = {lat: 41.850033, lng: -87.6500523};
                var mapObject = new google.maps.Map(document.getElementById("map"), {
                    zoom: 5,
                    center: Chicago
                });
                var firstResult = true;

                doctorsArr.forEach(function (doctor) {
                    var practicesArr = [];
                    doctor.practices.forEach(function (practice) {
                        practicesArr.push(practice);
                    });

                    practicesArr.forEach(function (practice) {
                        var addressForMap =
                            practice.visit_address.street +
                            "<br>" +
                            practice.visit_address.city +
                            ", " +
                            practice.visit_address.state +
                            " " +
                            practice.visit_address.zip;
                        var address = addressForMap.replace("<br>", " ");

                        $.get(
                            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                            address
                        ).then(function (response) {
                            console.log(response.results);
                            var latitude = response.results[0].geometry.location.lat;
                            var longitude = response.results[0].geometry.location.lng;
                            var marker = new google.maps.Marker({
                                position: {lat: latitude, lng: longitude},
                                map: mapObject
                            });

                            var infoContent = '<h5 id = "popup">' + doctor.profile.first_name + " " +
                                doctor.profile.last_name + '</h5>' + '<p id="popup">' + addressForMap  + '</p>';

                            var info = new google.maps.InfoWindow({
                                content: infoContent
                            });

                            marker.addListener('click', function() {
                                if (info.getMap()) {
                                    info.close(map, marker);
                                } else {
                                    info.open(map,marker)
                                }
                            });

                             marker.addListener('dblclick', function() {
                                 mapObject.panTo({lat: latitude, lng: longitude});
                                 if (mapObject.zoom < 17) {
                                     mapObject.setZoom(17);
                                 } else {
                                     mapObject.setZoom(5);
                                 }

                             });

                            if (firstResult) {
                                mapObject.panTo({lat: latitude, lng: longitude});
                                firstResult = false;
                            }
                            // console.log(response.lat);
                            // console.log(response.lng);
                        });
                    });
                });
            })
            .fail(function (error) {
                console.log("fail");
                $('#doctor-list').empty();
                $('#doctor-list').append(
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
        $('#doctor-list').empty()
        $('#doctor-list').append(
            '<div class="well">' +
            '<h3>' +
            'Your must specify the state if you specify a city.' +
            '</h3>' +
            '</div>'
        );
        return false;
    }
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
