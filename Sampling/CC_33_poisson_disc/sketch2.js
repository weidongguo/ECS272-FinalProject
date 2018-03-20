// Poisson Disc Sampling
// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for this video: https://youtu.be/flQgnCUxHlw
// *Adapted by Baotuan Nguyen for ECS272 Project (SF Health Inspection Dataset)

var minLat = 37.668824;
var maxLat = 37.834628;
var minLong = -122.510896;
var maxLong = -122.264171;

var side = 400
var r = 10;
var k = 30;
var grid = [];
var w = r / Math.sqrt(2);
var cols, rows;
var active = [];
var keepIndices = [];
var myset = new Set();

function setup() {
  createCanvas(side, side);
  background(0);
  strokeWeight(8);
  colorMode(HSB);

  // STEP 0
  cols = floor(width / w);
  rows = floor(height / w);
  for (var i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }

  // STEP 1
  var x = scaleLongitude(healthData[0].business_longitude);
  var y = scaleLatitude(healthData[0].business_latitude);
  var i = floor(x / w); //grid location
  var j = floor(y / w);
  var pos = createVector(x, y, 0);
  grid[i + j * cols] = pos;
  active.push(pos);
  //frameRate(1);
}

function draw() {
  background(0);

  if (active.length > 0) {
    var randIndex = floor(random(active.length));
    var pos = active[randIndex];
    var found = false;
    for (var n = 0; n < k; n++) {
      // var sample = p5.Vector.random2D();
      // var m = random(r, 2 * r);
      // sample.setMag(m);
      // sample.add(pos);
      //var newSampleIndex = pos.z+1+floor(random(20));
      var newSampleIndex = floor(random(healthData.length));
      var sample = healthData[newSampleIndex]
      var col = floor(scaleLongitude(sample.business_longitude) / w);
      var row = floor(scaleLatitude(sample.business_latitude) / w);

      if (col > -1 && row > -1 && col < cols && row < rows && !grid[col + row * cols]) {
        var ok = true;
        for (var i = -1; i <= 1; i++) {
          for (var j = -1; j <= 1; j++) {
            var index = (col + i) + (row + j) * cols;
            var neighbor = grid[index];
            if (neighbor) {
              var d = Math.sqrt(Math.pow(scaleLatitude(sample.business_latitude)-scaleLatitude(neighbor.business_latitude), 2) + Math.pow(scaleLongitude(sample.business_longitude)-scaleLongitude(neighbor.business_longitude), 2))//p5.Vector.dist(sample, neighbor);
              if (d < r) {
                ok = false;
              }
            }
          }
        }
        if (ok) {
          console.log("Found")
          found = true;
          sample = createVector(scaleLongitude(sample.business_longitude), scaleLatitude(sample.business_latitude), newSampleIndex)
          grid[col + row * cols] = sample;
          active.push(sample);
          // Should we break?
          break;
        }
      }
    }

    if (!found) {
      console.log("Not Found")
      active.splice(randIndex, 1);
    }

  }
  

  for (var i = 0; i < grid.length; i++) {
    if (grid[i]) {
      stroke(i % 360, 100, 100);
      strokeWeight(2);
      point(grid[i].x, grid[i].y);
    }
  }

  for (var i = 0; i < active.length; i++) {
    stroke(255);
    strokeWeight(2);
    point(active[i].x, active[i].y);
 }



}

function scaleLongitude(longitude){
  return floor(side*(longitude - minLong)/(maxLong-minLong))
}

function scaleLatitude(latitude){
  return floor(side*(latitude - minLat)/(maxLat - minLat))
}

grid.forEach(function(element){
    if(element != undefined)
      keepIndices.push(element.z)
  });

function getString(){
  grid.forEach(function(element){
      if(element != undefined)
        keepIndices.push(element.z)
    });

  var s = "[";
  keepIndices.forEach(function(element){
     s += element + ", "
    });
  s += "]";
  return s;
}

function getNumClassses(){
  keepIndices.forEach(function(element){
    if(!myset.has(data[element].category)){
      myset.add(data[element].category)
    }
  })
  return myset.size;
}