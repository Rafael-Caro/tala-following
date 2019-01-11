//general variables
var recTal;
var talInfo;
var talMenu = ["tīntāl", "ektāl", "jhaptāl", "rūpak tāl"];
//tal features
var talName;
var avart;
var strokeCircles = []; //list of strokeCircles
//style
var radiusBig; //radius of the big circle
var radius1 = 25; //radius of accented matra
var radius2 = 20; //radius of unaccented matra
var backColor;
var mainColor;
var matraColor;
//machanism
var speed;
var tempo;
// var cursorX; //cursor line's x
// var cursorY; //cursor line's y
// var angle = -90; //angle of the cursor
var navCursor;
var navCursorW = 5;
var cursor;
var shade;
// var alpha;
// var position = 0;
// var playing = false;
var playingTal = false;
var timeDiff;
//html interaction
var button;//sounds
var loaded = false;
var navBoxX = 10;
var navBoxH = 60;
var navBoxY;
var navBox;
var talBoxes = [];
// Sounds
var trackDuration;
var track;
var initLoading;
// Icons
var wave;
var clap;
var iconSamSize = radius1*1.7;
var iconSize = radius2*1.7;
var iconDistance = 0.77;
var icons = [];

function preload () {
  recTal = loadJSON("files/bfefde58-4eb2-49b0-9c63-7e4ce1070e61.json");
  talInfo = loadJSON("files/talInfo.json");
  wave = loadImage("files/wave.svg");
  clap = loadImage("files/clap.svg");
}

function setup() {
  var canvas = createCanvas(600, 600);
  var div = createDiv()
    .id("sketch-holder")
    .style("width: " + width + "px; margin: 10px auto; position: relative;");
  // var divElem = new p5.Element(input.elt);
  // divElem.style
  canvas.parent("sketch-holder");
  ellipseMode(RADIUS);
  angleMode(DEGREES);
  imageMode(CENTER);
  //style
  radiusBig = width * (0.3);
  navBoxY = height-navBoxH-navBoxX;
  trackDuration = recTal.info.duration;
  backColor = color(185, 239, 162);
  mainColor = color(249, 134, 50);
  matraColor = color(249, 175, 120);
  //html interaction
  button = createButton("Carga el audio")
    .size(120, 25)
    .position(width-130, 10)
    .mousePressed(player)
    .parent("sketch-holder");
    // .style("position: static;");
  //start tal
  // start();
  // updateTempo();
  navBox = new CreateNavigationBox();
  navCursor = new CreateNavCursor();
  for (var i = 0; i < recTal.info.talList.length; i++) {
    var tal = recTal.info.talList[i];
    talBox = new CreateTalBox(tal, recTal[tal].start, recTal[tal].end);
    talBoxes.push(talBox);
  }
}

function draw() {
  background(backColor);

  push();
  translate(width/2, height/2);
  rotate(-90);

  // noStroke();
  // alpha = map((angle+90)%360, 0, 360, 0, 255);
  // mainColor.setAlpha(alpha);
  // fill(mainColor);
  // arc(0, 0, radiusBig, radiusBig, -90, angle%360);

  if (playingTal) {
    shade.update();
    shade.display();
  }
  noFill();
  strokeWeight(2);
  mainColor.setAlpha(255);
  stroke(mainColor);
  ellipse(0, 0, radiusBig, radiusBig);
  //draw circle per bol
  for (var i = 0; i < strokeCircles.length; i++) {
    strokeCircles[i].display();
  }
  for (var i = 0; i < icons.length; i++) {
    icons[i].display();
  }
  if (playingTal) {
    cursor.update();
    cursor.display();
  }
  pop();

  navBox.displayBack();

  if (loaded) {
    navCursor.update();
    navCursor.display();
    for (var i = 0; i < talBoxes.length; i++) {
      talBoxes[i].update();
    }
  }

  for (var i = 0; i < talBoxes.length; i++) {
    talBoxes[i].display();
  }
  navBox.displayFront();

  textAlign(CENTER, CENTER);
  textSize(30);
  strokeWeight(5);
  stroke(0);
  fill(mainColor);
  text(talName, width/2, height/2);

  // position = updateCursor(position);

  //cursor
  // stroke(mainColor);
  // line(0, 0, cursorX, cursorY);
  // fill("red");
  // noStroke();
  // ellipse(cursorX, cursorY, 5, 5);
}

function startTal() {
  //restart values
  strokeCircles = [];
  icons = [];
  // strokePlayPoints = [];
  cursorX = 0;
  cursorY = -radiusBig;
  var angle = 0;
  // button.html("¡Comienza!");
  // playing = false;

  var talSortName = select.value();
  var tal = recTal[talSortName];
  talName = tal["name"];
  avart = tal["avart"];
  var tempoInit = tal["tempoInit"];
  var theka = tal["theka"];
  for (var i = 0; i < theka.length; i++) {
    var stroke = theka[i];
    var matra = stroke["matra"];
    var vibhag; //tali or khali
    if (int(stroke["vibhag"]) > 0) {
      vibhag = "tali";
    } else {
      vibhag = "khali";
    }
    var circleType;
    if (i == 0) {
      circleType = "sam";
      var icon = new CreateIcon(matra, vibhag, iconSamSize);
      icons.push(icon);
    } else if ((stroke["vibhag"] % 1) < 0.101) {
      circleType = 1;
      var icon = new CreateIcon(matra, vibhag, iconSize);
      icons.push(icon);
    } else if ((stroke["vibhag"] * 10 % 1) == 0) {
      circleType = 2;
    } else {
      circleType = 3;
    }
    var bol = stroke["bol"];
    var strokeCircle = new StrokeCircle(matra, vibhag, circleType, bol);
    strokeCircles[i] = strokeCircle;
    if (strokeCircle.circleAngle < 0) {
      strokePlayPoints[i] = 360 + strokeCircle.circleAngle;
    } else {
      strokePlayPoints[i] = strokeCircle.circleAngle;
    }
  }
  slider.value(tempoInit);
  updateTempo();
}

function StrokeCircle (matra, vibhag, circleType, bol) {
  this.bol = bol;
  var increment = 1;
  this.strokeWeight = 2;

  if (circleType == "sam") {
    if (vibhag == "tali") {
      this.col = mainColor;
    } else {
      this.col = backColor;
    }
  } else if (vibhag == "tali") {
    this.col = matraColor;
  } else if (vibhag == "khali") {
    this.col = backColor;
  }

  if (circleType == "sam") {
    this.radius = radius1;
    this.txtStyle = BOLD;
    this.bol = this.bol.toUpperCase();
    this.volume = 1;
  } else if (circleType == 1) {
    this.radius = radius1;
    this.txtStyle = BOLD;
    this.volume = 1;
  } else if (circleType == 2){
    this.radius = radius2;
    this.txtStyle = NORMAL;
    this.volume = 0.7;
  } else {
    this.radius = radius2;
    this.col = color(0, 0);
    this.txtStyle = NORMAL;
    this.strokeWeight = 0;
    this.volume = 0.7;
    increment = 1.05;
  }

  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * increment * cos(this.circleAngle);
  this.y = radiusBig * increment * sin(this.circleAngle);

  this.display = function () {
    push();
    translate(this.x, this.y);
    stroke(mainColor);
    strokeWeight(this.strokeWeight);
    fill(this.col);
    ellipse(0, 0, this.radius, this.radius);

    textAlign(CENTER, CENTER);
    noStroke();
    fill(0);
    textSize(this.radius * 0.75);
    textStyle(this.txtStyle);
    rotate(90);
    text(this.bol, 0, 0);
    pop();
  }

  this.clicked = function () {
    var x = -mouseY+height/2;
    var y = mouseX-width/2;
    var d = dist(this.x, this.y, x, y);
    if (d < this.radius) {
      soundDic[this.bol.toLowerCase()].play();
    }
  }
}

function CreateNavigationBox () {
  this.w = width - navBoxX * 2;

  this.displayBack = function () {
    fill(0, 50);
    noStroke();
    rect(navBoxX, navBoxY, this.w, navBoxH);
    for (var i = 0; i < recTal.info.talList.length; i++) {
      var tal = recTal[recTal.info.talList[i]];
      for (var j = 0; j < tal.sam.length; j++) {
        var samX = map(tal.sam[j], 0, trackDuration, navBoxX+navCursorW/2, navBoxX+this.w-navCursorW/2);
        stroke(255);
        strokeWeight(1);
        line(samX, navBoxY, samX, navBoxY+navBoxH);
      }
    }
  }

  this.displayFront = function () {
    stroke(0, 150);
    strokeWeight(2);
    line(navBoxX+1, navBoxY, navBoxX+this.w, navBoxY);
    line(navBoxX+this.w, navBoxY, navBoxX+this.w, navBoxY+navBoxH);
    strokeWeight(1);
    line(navBoxX, navBoxY, navBoxX, navBoxY+navBoxH);
    line(navBoxX, navBoxY+navBoxH, navBoxX+this.w, navBoxY+navBoxH);
  }

  this.clicked = function () {
    var xA = navBoxX;
    var xZ = navBoxX+this.w;
    var yA = navBoxY;
    var yZ = navBoxY+navBoxH;
    if (mouseX > xA && mouseX < xZ && mouseY > yA && mouseY < yZ) {
      var jumpTo = map(mouseX, xA, xZ, 0, trackDuration);
      track.jump(jumpTo);
    }
  }
}

function CreateNavCursor () {
  this.x = navBoxX + navCursorW/2;
  this.update = function () {
    this.x = map(track.currentTime(), 0, trackDuration, navBoxX + navCursorW/2, navBoxX + navBox.w - navCursorW/2);
  }
  this.display = function () {
    stroke(mainColor);
    strokeWeight(navCursorW);
    line(this.x, navBoxY+navCursorW/2, this.x, navBoxY+navBoxH-navCursorW/2);
  }
}

function CreateTalBox (name, start, end) {
  this.h = 20;
  this.x = map(start, 0, trackDuration, navBoxX, navBoxX+navBox.w);
  this.x2 = map(end, 0, trackDuration, navBoxX, navBoxX+navBox.w);
  this.w = this.x2-this.x;
  this.boxCol = color(255, 100);
  this.txtCol = color(100);
  this.txtStyle = NORMAL;
  this.txtBorder = 0;
  this.off = function () {
    this.boxCol = color(255, 100);
    this.txtCol = color(100);
    this.txtStyle = NORMAL;
    this.txtBorder = 0;
  }
  this.on = function () {
    mainColor.setAlpha(100);
    this.boxCol = mainColor;
    this.txtCol = color(0);
    this.txtStyle = BOLD;
    this.txtBorder = 1;
  }
  this.update = function () {
    if (navCursor.x > this.x && navCursor.x < this.x2) {
      this.on();
    } else {
      this.off();
    }
  }
  this.display = function () {
    fill(this.boxCol);
    noStroke();
    rect(this.x, navBoxY, this.w, this.h);
    textAlign(LEFT, CENTER);
    textSize(this.h * 0.7);
    fill(this.txtCol);
    textStyle(this.txtStyle);
    fill(0);
    stroke(mainColor);
    strokeWeight(this.txtBorder);
    text(name, this.x+2, navBoxY + this.h/2);
  }
}

function CreateCursor () {
  this.x = 0;
  this.y = -radiusBig;
  this.angle = 0;
  this.position = 0;
  this.update = function () {
    var position = millis() - timeDiff;
    var increase = position - this.position;
    this.angle += (360 * increase) / speed;
    if (this.angle > 360) {
      this.angle -= 360;
    }
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
    this.position = position;
  }
  this.display = function () {
    fill("red");
    noStroke();
    ellipse(this.x, this.y, 5, 5)
  }
}

function CreateShade () {
  this.x = 0;
  this.y = -radiusBig;
  this.angle = 0;
  this.position = 0;
  this.alpha = 0;
  this.col = mainColor;
  this.update = function () {
    var position = millis() - timeDiff;
    var increase = position - this.position;
    this.angle += (360 * increase) / speed;
    if (this.angle > 360) {
      this.angle -= 360;
    }
    // var alphaAngle = this.angle + 90;
    // if (alphaAngle > 360) {
    //   alphaAngle -= 360;
    // }
    this.alpha = map(this.angle, 0, 360, 0, 255);
    this.x = radiusBig * cos(this.angle);
    this.y = radiusBig * sin(this.angle);
    this.position = position;
  }
  this.display = function () {
    this.col.setAlpha(this.alpha);
    fill(this.col);
    noStroke();
    arc(0, 0, radiusBig, radiusBig, 0, this.angle);
  }
}

function CreateIcon (matra, vibhag, size) {
  this.circleAngle = map(matra, 0, avart, 0, 360);
  this.x = radiusBig * iconDistance * cos(this.circleAngle);
  this.y = radiusBig * iconDistance * sin(this.circleAngle);
  if (vibhag == "tali") {
    this.img = clap;
  } else if (vibhag == "khali") {
    this.img = wave;
  }

  this.display = function () {
    push();
    translate(this.x, this.y);
    rotate(90);
    image(this.img, 0, 0, size, size);
    pop();
  }
}

// function strokePlayer (angle) {
//   var checkPoint = strokePlayPoints[strokeToPlay];
//   if (checkPoint == 0) {
//     if (angle < strokePlayPoints[strokePlayPoints.length-1]) {
//       var sC = strokeCircles[strokeToPlay];
//       var sound = soundDic[sC.bol.toLowerCase()];
//       sound.setVolume(sC.volume);
//       sound.play();
//       strokeToPlay++;
//     }
//   } else {
//     if (angle >= checkPoint) {
//       var sC = strokeCircles[strokeToPlay];
//       var sound = soundDic[sC.bol.toLowerCase()];
//       sound.setVolume(sC.volume);
//       sound.play();
//       strokeToPlay++;
//     }
//   }
//   if (strokeToPlay == strokePlayPoints.length) {
//     strokeToPlay = 0;
//   }
// }

// function updateTempo () {
//   tempo = slider.value();
//   speed = avart * (60 / tempo) * 1000;
// }

// function playTal() {
//   if (playing == false) {
//     timeDiff = millis();
//     cursor = new CreateCursor();
//     shade = new CreateShade();
//     playing = true;
//     button.html("Para");
//     strokeToPlay = 0;
//     strokePlayer(0);
//   } else {
//     playing = false;
//     button.html("¡Comienza!");
//   }
// }

function player() {
  if (loaded) {
    if (track.isPlaying()) {
      track.stop();
      button.html("¡Comienza!");
    } else {
    track.play();
    button.html("Para");
    }
  } else {
    initLoading = millis();
    track = loadSound("sounds/bfefde58-4eb2-49b0-9c63-7e4ce1070e61.mp3", soundLoaded, function(){print("loading failed")}, loading);
  }
}

function soundLoaded() {
  button.html("¡Comienza!");
  button.removeAttribute("disabled");
  loaded = true;
  var endLoading = millis();
  print("Track loaded in " + (endLoading-initLoading)/1000 + " seconds");
}

function loading() {
  button.html("Cargando...");
  button.attribute("disabled", "");
}

function mousePressed() {
  if (loaded && track.isPlaying()) {
    for (var i = 0; i < strokeCircles.length; i++) {
      strokeCircles[i].clicked();
    }
  }
  if (loaded) {
    navBox.clicked();
  }
}
