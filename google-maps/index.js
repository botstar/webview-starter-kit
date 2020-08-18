var selectedLat;
var selectedLng;
var selectedName;
var selectedAddress;

function onChatBotReady() {
  // You have to define HTML meta "bs:input:googlemapsKey" in order to inform bot send data to googlemapsKey parameter webview
  var apiKey = BotStarWebview('getParameter', 'googlemapsKey');

  loadGoogleMaps(apiKey);
}

function sendResponse() {
  var outputs = {
    latitude: selectedLat,
    longitude: selectedLng,
    name: selectedName,
    address: selectedAddress,
  };

  /*
    @param state: set chatbot's latest response to emtpy. It is string only.
    @param outputs: will be sent back to chatbot. You have to define HTML meta "bs:output:latitude", "bs:output:longitude", "bs:output:name", "bs:output:address" in order to send back.
                    You can send as many pro as you want, i.e: { customerName: 'Tommy', age: maxAge }
                    then define two HTML metas "bs:output:customerName" and "bs:output:age"
    @param Chose Location: outlet name, will be sent back to chatbot. You have to define HTML meta "bs:outlet:Chose Location" in order to send back.
  */
  BotStarWebview('sendResponse', '', outputs, 'Chose Location').catch((err) => {
    console.log(err);
  });
}

function loadGoogleMaps(apiKey) {
  apiKey = apiKey || 'AIzaSyCUOoYXz3VMVKIv4Mvdv_qdnwV5ktvt6SY';
  var tag = document.createElement('script');
  tag.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

function initMap() {
  var DefaultPlace = { lat: 1.2864334, lng: 103.84914 };
  var map = new google.maps.Map(document.getElementById('map'), {
    center: DefaultPlace,
    zoom: 8,
    mapTypeControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
  });
  var placesService = new google.maps.places.PlacesService(map);
  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');
  var types = document.getElementById('type-selector');
  var strictBounds = document.getElementById('strict-bounds-selector');

  map.addListener('click', handleClick);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindow.setContent(infowindowContent);

  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  autocomplete.addListener('place_changed', function () {
    showPlace(autocomplete.getPlace());
  });

  function handleClick(event) {
    marker.setVisible(false);
    infowindow.close();

    selectedLat = event.latLng.lat();
    selectedLng = event.latLng.lng();

    marker.setPosition(event.latLng);
    marker.setVisible(true);

    if (isIconMouseEvent(event)) {
      event.stop();
      placesService.getDetails({ placeId: event.placeId }, function (place, status) {
        if (status === 'OK') {
          showPlace(place);
        }
      });
    } else {
      infowindowContent.children['place-icon'].src = '';
      infowindowContent.children['place-name'].textContent = '';
      infowindowContent.children['place-address'].textContent = `Location: ${selectedLat}, ${selectedLng}`;
      infowindow.open(map, marker);
    }
  }

  function showPlace(place) {
    infowindow.close();
    marker.setVisible(false);
    if (!place.geometry) {
      window.alert("No details available for input: '" + place.name + "'");
      return;
    }

    if (place.geometry.viewport) {
      map.fitBounds(place.geometry.viewport);
    } else {
      map.setCenter(place.geometry.location);
      map.setZoom(17);
    }

    selectedLat = place.geometry.location.lat();
    selectedLng = place.geometry.location.lng();
    marker.setPosition(place.geometry.location);
    marker.setVisible(true);

    var address = '';
    if (place.address_components) {
      address = [
        (place.address_components[0] && place.address_components[0].short_name) || '',
        (place.address_components[1] && place.address_components[1].short_name) || '',
        (place.address_components[2] && place.address_components[2].short_name) || '',
      ].join(' ');
    }

    selectedName = place.name;
    selectedAddress = address;

    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindow.open(map, marker);
  }

  function isIconMouseEvent(e) {
    return 'placeId' in e;
  }
}
