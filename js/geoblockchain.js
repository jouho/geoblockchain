var w3wIcon = L.icon({
  iconUrl: 'https://what3words.com/map/images/marker-18.png',
  iconSize: [50, 50], // size of the icon
  iconAnchor: [22, 94], // point of the icon which will correspond to marker's location
});

var map = L.map('map', {
  zoomControl: false
}).setView([47.655548, -122.303200], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  maxNativeZoom: 19,
  maxZoom: 25
}).addTo(map);
new L.Control.Zoom({
  position: 'bottomright'
}).addTo(map);

var arcgisOnline = L.esri.Geocoding.arcgisOnlineProvider();

L.esri.Geocoding.geosearch({
  providers: [
    arcgisOnline,
    L.esri.Geocoding.mapServiceProvider({
      label: 'States and Counties',
      url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
      layers: [2, 3],
      searchFields: ['NAME', 'STATE_NAME']
    })
  ]
}).addTo(map);

function drawGrid() {
  const zoom = map.getZoom();
  const loadFeatures = zoom > 17;

  if (loadFeatures) { // Zoom level is high enough
    var ne = map.getBounds().getNorthEast();
    var sw = map.getBounds().getSouthWest();

    // Call the what3words Grid API to obtain the grid squares within the current visble bounding box
    what3words.api
      .gridSectionGeoJson({
        southwest: {
          lat: sw.lat,
          lng: sw.lng
        },
        northeast: {
          lat: ne.lat,
          lng: ne.lng
        }
      }).then(function(data) {
        // If the grid layer is already present, remove it as it will need to be replaced by the new grid section
        if (typeof grid_layer !== 'undefined') {
          map.removeLayer(grid_layer);
        }

        // Create a new GeoJSON layer, based on the GeoJSON returned from the what3words API
        grid_layer = L.geoJSON(data, {
          style: function() {
            return {
              color: '#777',
              stroke: true,
              weight: 0.5
            };
          }
        }).addTo(map);
      }).catch(console.error);
  } else {
    // If the grid layer already exists, remove it as the zoom level no longer requires the grid to be displayed
    if (typeof grid_layer !== 'undefined') {
      map.removeLayer(grid_layer);
    }
  }
}

map.whenReady(drawGrid);
map.on('move', drawGrid);

var marker = L.marker([47.655548, -122.303200], {
  icon: w3wIcon
}).addTo(map);

var center;
var latlng;

map.on('dragend', function() {
  center = map.getCenter();
  var lat = center.lat.toString().substring(0, center.lat.toString().indexOf(".") + 6);
  var lng = center.lng.toString().substring(0, center.lng.toString().indexOf(".") + 6);
  latlng = lat + " " + lng;
  marker.setLatLng(center);
  // console.log(center);
  // console.log(latlng);
});

// Initialize Web3
if (typeof web3 !== 'undefined') {
  web3 = new Web3(window.web3.currentProvider);
} else {
  web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:7545'));
}

// Set Contract Abi
var contractAbi = [
	{
		"constant": false,
		"inputs": [
			{
				"name": "amount",
				"type": "uint256"
			},
			{
				"name": "latlng",
				"type": "string"
			}
		],
		"name": "donate",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_coordinate",
				"type": "string"
			},
			{
				"name": "_owner",
				"type": "string"
			},
			{
				"name": "_description",
				"type": "string"
			},
			{
				"name": "_goal",
				"type": "uint256"
			}
		],
		"name": "register",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "latlng",
				"type": "string"
			}
		],
		"name": "getBalance",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [],
		"name": "getCoordinates",
		"outputs": [
			{
				"name": "",
				"type": "string[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "latlng",
				"type": "string"
			}
		],
		"name": "getOwnerInfo",
		"outputs": [
			{
				"name": "",
				"type": "string"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
]; // Add Your Contract ABI here!!!

// Set Contract Address
var contractAddress = '0x282CF3194404ba497513a04Fc04A8db7586652F7'; // Add Your Contract address here!!!

// Set the wallet address which will hold all the funds
var megaWallet = '0x75Bf00DBBb240a10BBfF0192ab82BCF8C84d920E';

// Set the Contract
var contract = new web3.eth.Contract(contractAbi, contractAddress);

// array of coordinates (lng, lat)
var locations;

// length of above array
var arrayLength;

var latlng_onclick;

var donation_amount;

web3.eth.getAccounts().then(function(accounts) {
  contract.methods.getCoordinates().call(function(err, result) {
    locations = result;
    arrayLength = locations.length;
    for (var i = 0; i < arrayLength; i++) {

      var marker_coordinates = locations[i]

      // contract.methods.getBalance(marker_coordinates).call(function(err, result) {
      //   console.log(result);
      //   donation_amount = result;
      // });
      var marker_longitude = Number(marker_coordinates.substring(0, 8));
      var marker_latitude = Number(marker_coordinates.substring(9));
      var marker = L.circleMarker([marker_longitude, marker_latitude], {
        radius: 10,
        fillColor: "#ff7800",
        color: "#000",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).bindPopup(marker_coordinates + '<br>' +
        '<br><button onclick="donate()" id="button">Donate</button> <br><br><button onclick="seeValue()" id="button">Info</button>').addTo(map)
      marker.on('click', onClick);
      function onClick(e) {
        var popup = e.target.getPopup();
        var content = popup.getContent();
        latlng_onclick = content.substring(0, 19);
        console.log(latlng_onclick);
      }
    }
  });
});

// function triggered when register button is clicked
function register() {
  event.preventDefault();
  var projectName = document.getElementById("projectname").value;
  var description = document.getElementById("description").value;
  var goalAmount = document.getElementById("goalamount").value;
  goalAmount = parseInt(goalAmount);
  console.log(latlng, projectName, description, goalAmount);
  web3.eth.getAccounts().then(function(accounts) {
    contract.methods.register(latlng, projectName, description, goalAmount).send({
      from: accounts[0],
      gas: 6721975
    });
  });

  web3.eth.getAccounts().then(function(accounts) {
    contract.methods.getCoordinates().call(function(err, result) {
      locations = result;
    });
  });
  // location.reload();
}

$('#button2').on('click', function() {
  $('.center').show();
  $(this).hide();
})

$('#close').on('click', function() {
  $('.center').hide();
  $('#button2').show();
})

// function triggered when donate button is clicked
function donate() {
  var userPrompt = prompt("Please provide an amount to donate in Ether");
  event.preventDefault();
  var amount = userPrompt;
  console.log(amount)
  web3.eth.getAccounts().then(function(accounts) {
    contract.methods.donate(parseInt(amount), latlng_onclick).send({
      from: accounts[0]
    });
    var sender = accounts[0];
    web3.eth.sendTransaction({
      from: sender,
      to: megaWallet,
      value: web3.utils.toWei(amount, 'ether')
    });
  });
}

// function triggered when 'see the value' button is clicked
function seeValue() {
  contract.methods.getBalance(latlng_onclick).call(function(err, result) {
    console.log(result + ' Ether received!')
  });
}
