var defaultAddress;
var buttonName;
var selectedLat;
var selectedLng;
var selectedName;
var selectedAddress;

function onChatBotReady() {
  // You have to define HTML meta "bs:input:googlemapsKey" in order to inform bot send data to googlemapsKey parameter webview
  var apiKey = BotStarWebview('getParameter', 'googlemapsKey');

  // You have to define HTML meta "bs:input:defaultAddress" in order to inform bot send data to defaultAddress parameter webview
  defaultAddress = BotStarWebview('getParameter', 'defaultAddress');

  // You have to define HTML meta "bs:input:buttonName" in order to inform bot send data to buttonName parameter webview
  buttonName = BotStarWebview('getParameter', 'buttonName');

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
    @param state: set chatbot's latest response to emtpy. It is string or empty string only.
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
      style: google.maps.MapTypeControlStyle.DROPDOWN_MENU,
      position: google.maps.ControlPosition.TOP_RIGHT,
    },
  });
  var placesService = new google.maps.places.PlacesService(map);
  var autocompleteService = new google.maps.places.AutocompleteService(map);
  var card = document.getElementById('pac-card');
  var input = document.getElementById('pac-input');

  map.addListener('click', handleClick);
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(card);

  var autocomplete = new google.maps.places.Autocomplete(input);
  autocomplete.bindTo('bounds', map);
  autocomplete.setFields(['address_components', 'geometry', 'icon', 'name']);

  var infowindow = new google.maps.InfoWindow();
  var infowindowContent = document.getElementById('infowindow-content');
  infowindowContent.children['choose-location'].appendChild(
    document.createTextNode(buttonName || 'Submit This Location')
  );
  infowindow.setContent(infowindowContent);

  var marker = new google.maps.Marker({
    map: map,
    anchorPoint: new google.maps.Point(0, -29),
  });

  if (defaultAddress) {
    autocompleteService.getPlacePredictions(
      {
        input: defaultAddress,
      },
      (results, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          showPlaceByPlaceId(results[0].place_id);
        }
      }
    );
  }

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
      showPlaceByPlaceId(event.placeId);
    } else {
      infowindowContent.children['place-icon'].style.display = 'none';
      infowindowContent.children['place-icon'].src = '';
      infowindowContent.children['place-name'].textContent = '';
      infowindowContent.children['place-address'].textContent = '';
      infowindowContent.children['place-lat'].textContent = `Latitude: ${selectedLat}`;
      infowindowContent.children['place-lng'].textContent = `Longitude: ${selectedLng}`;
      infowindow.open(map, marker);
    }
  }

  function showPlaceByPlaceId(placeId) {
    placesService.getDetails({ placeId }, function (place, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        showPlace(place);
      }
    });
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

    infowindowContent.children['place-icon'].style.display = 'initial';
    infowindowContent.children['place-icon'].src = place.icon;
    infowindowContent.children['place-name'].textContent = place.name;
    infowindowContent.children['place-address'].textContent = address;
    infowindowContent.children['place-lat'].textContent = '';
    infowindowContent.children['place-lng'].textContent = '';
    infowindow.open(map, marker);
  }

  function isIconMouseEvent(e) {
    return 'placeId' in e;
  }
}
