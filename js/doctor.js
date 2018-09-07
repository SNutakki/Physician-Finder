var apiKey = require("./../.env").apiKey;

function DoctorModule() {}

//main function
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

                        $.get(
                            "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                            address
                        ).then(function (response) {
                            console.log(response.results);
                            var latitude = response.results[0].geometry.location.lat;
                            var longitude = response.results[0].geometry.location.lng;

                            var prevZoom = mapObject.zoom;

                            var locFreeVal = isLocationNotFree(markerLookup, [latitude, longitude]);
                            if (locFreeVal === -1) {
                                var marker = new google.maps.Marker({
                                    position: {lat: latitude, lng: longitude},
                                    map: mapObject
                                });
                                markerLookup.push([latitude, longitude]);
                                var mkDblClkd = false;

                                var infoContent = '<div id = "info' + (markerLookup.length - 1) + '"> <h5 id = "popup">' +
                                    doctor.profile.first_name + " " +
                                    doctor.profile.last_name + '</h5>' + '<p id="popup">' +
                                    addressForMap + '</p>' + '</div>';

                                console.log("Displaying infoContent:" + infoContent);

                                var info = new google.maps.InfoWindow({
                                    content: infoContent
                                });

                                marker.addListener('click', function () {
                                    if (info.getMap()) {
                                        info.close(map, marker);
                                    } else {
                                        info.open(map, marker);
                                    }
                                });

                                marker.addListener('dblclick', function () {
                                    mapObject.panTo({lat: latitude, lng: longitude});
                                    if (mapObject.zoom < 17) {
                                        prevZoom = mapObject.zoom;
                                        mapObject.setZoom(17);
                                    }
                                    if (mkDblClkd && mapObject.zoom >= 17) {
                                        mapObject.setZoom(prevZoom);
                                    }
                                    mkDblClkd = !mkDblClkd;
                                });
                            } else {
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

                            if (practice === doctorsArr[0].practices[0]) {
                                mapObject.panTo({lat: latitude, lng: longitude});
                                mapObject.setZoom(17);
                            }
                        });
                    });
                });
            })
            .fail(function (error) {
                $('#doctor-list').empty().append(
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


function isLocationNotFree(lookup, search) {
    for (var i = 0, l = lookup.length; i < l; i++) {
        if (lookup[i][0] === search[0] && lookup[i][1] === search[1]) {
            return i;
        }
    }
    return -1;
}

exports.doctorModule = DoctorModule;
