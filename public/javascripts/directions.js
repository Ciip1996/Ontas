var labelSteps = document.getElementById("label_steps");

var routeText;
let instructionNumber = 0;

var calculateAndDisplayRoute = (
  directionsRenderer,
  directionsService,
  markerArray,
  stepDisplay,
  map,
  origin,
  destination
) => {
  // First, remove any existing markers from the map.
  for (var i = 0; i < markerArray.length; i++) {
    markerArray[i].setMap(null);
  }

  // Retrieve the start and end locations and create a DirectionsRequest using
  const type_travel = document.getElementById("dropdown_types").value;
  directionsService.route(
    {
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode[type_travel]
    },
    function(response, status) {
      // Route the directions and pass the response to a function to create
      // markers for each step.
      if (status === "OK") {
        document.getElementById("warnings-panel").innerHTML =
          "<b>" + response.routes[0].warnings + "</b>";
        directionsRenderer.setDirections(response);
        showSteps(response, markerArray, stepDisplay, map);
        // routeText = response.routes[0].legs[0];
      } else {
        window.alert("Directions request failed due to " + status);
      }
    }
  );
};

var showSteps = (directionResult, markerArray, stepDisplay, map) => {
  // For each step, place a marker, and add the text to the marker's infowindow.
  // Also attach the marker to an array so we can keep track of it and remove it
  // when calculating new routes.
  var myRoute = directionResult.routes[0].legs[0];
  for (var i = 0; i < myRoute.steps.length; i++) {
    var marker = (markerArray[i] = markerArray[i] || new google.maps.Marker());
    marker.setMap(map);
    marker.setPosition(myRoute.steps[i].start_location);
    attachInstructionText(
      stepDisplay,
      marker,
      myRoute.steps[i].instructions,
      map
    );
  }
  routeText = myRoute;
};

var attachInstructionText = (stepDisplay, marker, text, map) => {
  google.maps.event.addListener(marker, "click", function() {
    // Open an info window when the marker is clicked on, containing the text
    // of the step.
    stepDisplay.setContent(text);
    stepDisplay.open(map, marker);
  });

  routeText = text;
  document.getElementById("card_directions").style.display = "block";
};

var nextStep = () => {
  if (instructionNumber + 1 < routeText.steps.length) {
    console.log(routeText.steps[instructionNumber].instructions);
    console.log(routeText);
    console.log(instructionNumber);
    instructionNumber++;
    document.getElementById("label_steps").innerHTML =
      routeText.steps[instructionNumber].instructions;

    followMarker(routeText.steps[instructionNumber].start_location);
  } else {
    instructionNumber = 0;
    document.getElementById("label_steps").innerText =
      "¡Haz llegado a tu destino!";
  }
};
