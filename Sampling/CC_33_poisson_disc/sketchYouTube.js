// Poisson Disc Sampling
// Daniel Shiffman
// http://codingtra.in
// http://patreon.com/codingtrain
// Code for this video: https://youtu.be/flQgnCUxHlw
// *Adapted by Baotuan Nguyen for ECS272 Project (YouTube Dataset)

var r = 5000;
var k = 5000;
var grid = [];
var w = r / Math.sqrt(2);
var cols, rows;
var active = [];
var keepIndices = [];
var myset = new Set();

function setup() {
  createCanvas(500, 500);
  background(0);
  strokeWeight(8);
  colorMode(HSB);

  width = 400000 //likes
  height = 200000 //comments

  // STEP 0
  cols = floor(width / w);
  rows = floor(height / w);
  for (var i = 0; i < cols * rows; i++) {
    grid[i] = undefined;
  }

  // STEP 1
  var x = data[0].likes;
  var y = data[0].comment_count;
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
      var newSampleIndex = floor(random(data.length));
      //var newSampleIndex = pos.z+1+floor(random(600));
      var sample = data[newSampleIndex]
      // if(set.size != 16)
      // {
      //   if(!myset.has(sample.category_id)){
      //     myset.add(sample.category_id)
      //     console.log("Got class: " + sample.category_id)
      //   }
      //   else
      //     continue
      // }
      var col = floor(sample.likes / w);
      var row = floor(sample.comment_count / w);

      if (col > -1 && row > -1 && col < cols && row < rows && !grid[col + row * cols]) {
        var ok = true;
        for (var i = -1; i <= 1; i++) {
          for (var j = -1; j <= 1; j++) {
            var index = (col + i) + (row + j) * cols;
            var neighbor = grid[index];
            if (neighbor) {
              var d = Math.sqrt(Math.pow((sample.x-neighbor.x), 2) + Math.pow((sample.y-neighbor.y), 2))//p5.Vector.dist(sample, neighbor);
              if (d < r) {
                ok = false;
              }
            }
          }
        }
        if (ok) {
          console.log("Found")
          found = true;
          sample = createVector(sample.likes, sample.comment_count, newSampleIndex)
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
      strokeWeight(8);
      point(grid[i].x/800, grid[i].y/400);
    }
  }

  for (var i = 0; i < active.length; i++) {
    stroke(255);
    strokeWeight(8);
    point(1+ active[i].x/800, active[i].y/400);
  }


  // for(var i = 0; i < data.length; i++)
  // {
  //   stroke(i % 360, 100, 100);
  //   strokeWeight(8);

  //   //if(data[i].likes < 1600 && data[i].comment_count < 1600)
  //     point(data[i].likes, data[i].comment_count);
  // }
}

//get string of selected indices, call after animation completes.
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

//get number of unique classes that were selected, call after getString has been called.
function getNumClassses(){
  keepIndices.forEach(function(element){
    if(!myset.has(data[element].category_id)){
      myset.add(data[element].category_id)
    }
  })
  return myset.size;
}

