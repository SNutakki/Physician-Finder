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
