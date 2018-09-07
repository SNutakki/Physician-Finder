# Physician Finder #

## Description
Physician Finder allows users to find doctors given names, cities, and/or specializations and displays the locations of their offices on a map.
Single-click a marker to move to a location and double-click a marker to zoom in (or zoom out when already zoomed in).


## Setup (OSX)

1. Visit the [BetterDoctor API](https://developer.betterdoctor.com/) and sign up to get an API key.  
2. Sign up, fill out the form, and submit your information.
3. Your API key should be listed on the front page (ex: “a2c356ibgh44…..”) or under My Account > Applications.
4. In Terminal,
  * type `cd doctor-finder` to access the path on your computer
  * type `npm install` , `bower install`, and `npm install gulp` to install the project's dependencies.
5. Edit .env file at the top level of the doctor-finder to read: exports.apiKey = "YOUR-API-KEY-HERE";
6. Type `gulp build` in Terminal while in the doctor-finder folder.
7. Type `open index.html` 
