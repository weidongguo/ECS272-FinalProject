googleMapStyles = [
  {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
  {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{color: '#263c3f'}]
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{color: '#6b9a76'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{color: '#38414e'}]
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{color: '#212a37'}]
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{color: '#9ca5b3'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{color: '#746855'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{color: '#1f2835'}]
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{color: '#f3d19c'}]
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{color: '#2f3948'}]
  },
  {
    featureType: 'transit.station',
    elementType: 'labels.text.fill',
    stylers: [{color: '#d59563'}]
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{color: '#17263c'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{color: '#515c6d'}]
  },
  {
    featureType: 'water',
    elementType: 'labels.text.stroke',
    stylers: [{color: '#17263c'}]
  }
]

var markers = []

function initMap() {
  // var geographicData = [{latitude:37.775474, longitude: -122.4159424}];
  var geographicData = sfhealthscore;
  locations = geographicData.map(function(d,i) {
    return {lat: d.business_latitude, lng: d.business_longitude};    
  })
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 10,
    center: locations[0],
    styles: googleMapStyles
  });

  var path = google.maps.SymbolPath.CIRCLE;
  locations.forEach(function(d, i){
    window.setTimeout(function() {
      var marker = new google.maps.Marker({
        position: {lat: d.lat, lng: d.lng},
        map: map,
        animation: google.maps.Animation.DROP,
        //label: d.stars + ""
        /*icon: {
          path: path,
          scale: 2,
          strokeWeight: 2,
          strokeColor: "#FF0000"
        }*/
      });
      /*
      var topKeyword = Object.keys(d.keywords)[0];
      var polarity = d.sentiment.polarity;
      var infoWindow = new google.maps.InfoWindow({
        content: `
          <div>
            <h6>${d.name}</h6>
            <p>${d.address}</p>
            <button type="button" class="btn btn-primary">
              Top keyword <span class="badge badge-light">${topKeyword}</span>
            </button>
            <br><br>
            <span class="badge badge-${polarity > 0 ? 'success' : 'danger'}">Review polarity: ${d.sentiment.polarity > 0 ? 'Positive' : 'Negative'}</span>
            <p>${d.review_count} customer reviews.</p>
            <span>
              <strong>Click</strong> to update the word cloud.
            </span>
          </div>
        `
      });
      */
      /*
      marker.addListener('click', () => {
        new WordCloud("#wordcloud", WordCloud.formatData(Object.keys(d.keywords)));
        d3.select("#title").text(d.name);
      });

      marker.addListener('mouseover', () => {
        d3.selectAll(`.linkedview-${i}`).classed("highlight", true);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', function() {
        d3.selectAll(`.linkedview-${i}`).classed("highlight", false);
        marker.setAnimation(null);
        infoWindow.close(map, marker);
      });
      marker.addListener('external-mouseout', function() {
        d3.selectAll(`.linkedview-${i}`).classed("highlight", false);
        marker.setAnimation(null);
        infoWindow.close(map, marker);
      });
      markers.push(marker);
      */
    }, 0);//500 * i);
  });

}
