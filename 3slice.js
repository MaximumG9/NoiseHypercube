
let canvases = []

const axisMargin = 0.075;

const DIVISION_COUNT = 8;
const TEXT_DIVISION_COUNT = 4;

const TEMPERATURE = { key:"T",name:"Temperature",idx:0};
const HUMIDITY = { key:"H",name:"Humidity",idx:1};
const EROSION = { key:"E",name:"Erosion",idx:2};
const CONTINENTALNESS = { key:"C",name:"Continentalness",idx:3};
const DEPTH = { key:"D",name:"Depth",idx:4};
const WEIRDNESS = { key:"W",name:"Weirdness",idx:5};

const noiseParams = [
	TEMPERATURE,
	HUMIDITY,
	EROSION,
	CONTINENTALNESS,
	DEPTH,
	WEIRDNESS
];

let noisePoint = [0,0,0,0,0,0];

let canvasAxes = [
	{x:TEMPERATURE,y:HUMIDITY},
	{x:EROSION,y:CONTINENTALNESS},
	{x:DEPTH,y:WEIRDNESS}
];

let axisSelectors = [
	{x:undefined,y:undefined},
	{x:undefined,y:undefined},
	{x:undefined,y:undefined},
];

let version = "1.21.11";

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

let mouseDown = false;

let valueText;

function updateDocShape() {
	let titleHeight = document.getElementById("ta").offsetHeight;
	let height = window.innerHeight - titleHeight;
	let width = window.innerWidth;

	let canvasLength = Math.max(
		Math.min(height,width)/2,
		Math.min(width/3,height),
		Math.min(width,height/3)
	);

	for(let i=0;i<canvases.length;i++) {
		canvases[i].width = canvasLength;
		canvases[i].height = canvasLength;
	}
}

function drawCanvas(xAxis,yAxis,canvas) {
	let ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	let length = canvas.width;
	
	if(xAxis === yAxis) {
		ctx.fillStyle = "red";
		ctx.font = `${length * 0.1}px Overpass Mono`
		let dim = ctx.measureText("Invalid Axes");

		ctx.fillText(
			"Invalid Axes",
			(length - dim.width)/2,
			length/2
		);
		return;
	}


	let insideLength = length * (1-(2*axisMargin));

	let farMargin = length * (1-axisMargin);
	let closeMargin = length * axisMargin;

	ctx.strokeStyle = "white";
	
	ctx.beginPath();
	ctx.moveTo(closeMargin,farMargin);
	ctx.lineTo(farMargin,farMargin);
	ctx.stroke();

	ctx.moveTo(closeMargin,farMargin);
	ctx.lineTo(closeMargin,closeMargin);
	ctx.stroke();
	
	let tickLength = length * 0.02;

	// X axis
	
	for(let i=0;i<=DIVISION_COUNT;i++) {
		ctx.moveTo(
			remapToXAxis(length,closeMargin,xAxis,(2 * i/DIVISION_COUNT) - 1),
			farMargin + tickLength/2
		);
		ctx.lineTo(
			remapToXAxis(length,closeMargin,xAxis,(2 * i/DIVISION_COUNT) - 1),
			farMargin - tickLength/2
		);
		ctx.stroke();
	}

	ctx.fillStyle = "white";

	let fontHeight = length * 0.025;

	ctx.font = `${fontHeight}px Overpass Mono`;

	for(let i=0;i<=TEXT_DIVISION_COUNT;i++) {
		let num = (2*i/TEXT_DIVISION_COUNT)-1;
		let measure = ctx.measureText(num);
		ctx.fillText(num,
			remapToXAxis(length,closeMargin,xAxis,num) - measure.width/2,
			farMargin + (tickLength * 1.75)
		);
	}

	// X axis label
	
	let xNameMeasure = ctx.measureText(xAxis.name);

	ctx.fillText(xAxis.name,
		insideLength/2 + closeMargin - xNameMeasure.width/2,
		length - (fontHeight * 0.5)
	);

	// Y axis
	
	for(let i=0;i<=DIVISION_COUNT;i++) {
		ctx.moveTo(closeMargin - tickLength/2,
			remapToYAxis(length,closeMargin,yAxis, (i / DIVISION_COUNT * 2)-1)
		);
		ctx.lineTo(closeMargin + tickLength/2,
			remapToYAxis(length,closeMargin,yAxis, (i / DIVISION_COUNT * 2)-1)
		);
		ctx.stroke();
	}

	ctx.fillStyle = "white";

	ctx.font = `${fontHeight}px Overpass Mono`;

	for(let i=0;i<=TEXT_DIVISION_COUNT;i++) {
		let num = (2*i/TEXT_DIVISION_COUNT)-1;
		let measure = ctx.measureText(num);
		//                                                                                                          THIS IS CURSED EVIL AND WRONG!!!
		ctx.fillText(
			num,
			closeMargin - (tickLength * 0.6) - measure.width,
			remapToYAxis(length,closeMargin,yAxis,num) + fontHeight/3
		);
	}

	// Y axis label
	
	let yNameMeasure = ctx.measureText(yAxis.name);

	ctx.save();

	ctx.rotate(0.5 * Math.PI);
	ctx.fillText(yAxis.name,
		(length - remapToXAxis(length,closeMargin,yAxis,0)) - (yNameMeasure.width/2),
		- (fontHeight * 0.5)
	);
	
	ctx.restore();

	// Compute biomes to draw

	let otherAxes = [];

	for(let i=0;i<noiseParams.length;i++) {
		if(
			noiseParams[i] == xAxis ||
			noiseParams[i] == yAxis
		) continue;
		otherAxes.push(noiseParams[i]);
	}

	let biomesToDraw = [];

dataLoop:
	for(let i=0;i<biomeData.length;i++) {
otherLoop:
		for(let j=0;j<otherAxes.length;j++) {
			let bounds = biomeData[i][otherAxes[j].key];

			if(otherAxes[j] === DEPTH && bounds[1] == 0 && noisePoint[DEPTH.idx] < 0) continue;

			if(noisePoint[otherAxes[j].idx] < bounds[0] || noisePoint[otherAxes[j].idx] > bounds[1]) continue dataLoop;
		}
		biomesToDraw.push(biomeData[i]);
	}

	
	// Draw biomes
	let biomeFontHeight = insideLength * 0.0125;

	ctx.font = `${biomeFontHeight}px Overpass Mono`;

	for(let i=0;i<biomesToDraw.length;i++) {
		let xBounds = biomesToDraw[i][xAxis.key];
		let yBounds = biomesToDraw[i][yAxis.key];

		if(yAxis == DEPTH && yBounds[1] === 0) {
			yBounds = [-1,0];
		}

		if(xAxis == DEPTH && xBounds[1] === 0) {
			xBounds = [-1,0];
		}


		let colour = biomeColours[biomesToDraw[i]["id"]];
		
		let minX = remapToXAxis(length, closeMargin,xAxis,xBounds[0]);
		let minY = remapToYAxis(length, closeMargin,yAxis,yBounds[1]); 

		let width = remapToXAxis(length,closeMargin,xAxis,xBounds[1]) - 
			remapToXAxis(length,closeMargin,xAxis,xBounds[0]);
		let height = remapToYAxis(length,closeMargin,yAxis,yBounds[0]) - 
			remapToYAxis(length,closeMargin,yAxis,yBounds[1]);

		if(width === 0 || height === 0) {
			ctx.beginPath();
			ctx.strokeStyle = colour;
			ctx.moveTo(minX,minY);
			ctx.lineTo(minX + width, minY + height);
			ctx.stroke();
		}

		ctx.fillStyle = `${colour}88`;
		
		ctx.fillRect(
			minX,
			minY,
			width,
			height
		);

		let rgb = hexToRgb(colour);

		if(rgb.r * 0.299 + rgb.g * 0.587 + rgb.b * 0.114 > 186) {
			ctx.fillStyle = "#000000";
		} else {
			ctx.fillStyle = "#ffffff";
		}
		let name = biomesToDraw[i].id.replace("minecraft:",""); 

		if(width === 0) {
			ctx.fillText(
				name,
				minX - ctx.measureText(name).width/2,
						// AGAIN!!! THIS IS CURSED BUT LOOKS CORRECT!!
				minY + height/2 + biomeFontHeight/3,
			);

			continue;
		}

		let lines = [];

		let lastIndex = 0;
		
outerLoop:
		do {
			for(let i=name.length;i>lastIndex;i--) {
				if(ctx.measureText(name.substring(lastIndex,i)).width + 2 < width) {
					lines.push(name.substring(lastIndex,i));
					lastIndex = i;
					break;
				} else if(lastIndex === i-1) {
					lines = [name];
					break outerLoop; 
				}
			}
		} while(lastIndex < name.length);

		for(let i=0;i<lines.length;i++) {
			ctx.fillText(
				lines[i],
				minX + width/2 - ctx.measureText(lines[i]).width/2,
				minY + height/2 + biomeFontHeight + ((i-lines.length/2)*(biomeFontHeight + 2)),
			);
		}
	}

	// Draw noise point
	
	ctx.fillStyle = "#ff0000";

	ctx.beginPath();

	ctx.arc(
		remapToXAxis(
			length,
			closeMargin,
			xAxis,
			noisePoint[xAxis.idx]
		),
		remapToYAxis(
			length,
			closeMargin,
			yAxis,
			noisePoint[yAxis.idx]
		),
		length * 0.01,
		0,
		2 * Math.PI
	);

	ctx.fill();
}

function updateNoiseNumbers() {
	let roundT = noisePoint[TEMPERATURE.idx].toFixed(2);
	let roundH = noisePoint[HUMIDITY.idx].toFixed(2);
	let roundC = noisePoint[CONTINENTALNESS.idx].toFixed(2);
	let roundE = noisePoint[EROSION.idx].toFixed(2);
	let roundD = noisePoint[DEPTH.idx].toFixed(2);
	let roundW = noisePoint[WEIRDNESS.idx].toFixed(2);

	valueText.innerText = 
		`T:${roundT} H:${roundH} C:${roundC} E:${roundE} D:${roundD} W:${roundW}`;
	if(hasDuplicateAxes()) {
		valueText.innerText = valueText.innerText + " (DUPLICATE AXES)";
	}
}

function hasDuplicateAxes() {
	let occured = [];
	for(let i=0;i<canvasAxes.length;i++) {
		if(occured[canvasAxes[i].x.idx]) return true;
		if(occured[canvasAxes[i].y.idx]) return true;
		occured[canvasAxes[i].x.idx] = true;
		occured[canvasAxes[i].y.idx] = true;
	}
	return false;
}

function onHoldCanvas(e) {
	if(mouseDown == false) return;

	let canvas = e.target;

	let canvasIdx = canvases.indexOf(canvas);

	let length = canvas.width;

	let margin = length * axisMargin;

	let xAxis = canvasAxes[canvasIdx].x;
	let yAxis = canvasAxes[canvasIdx].y;

	noisePoint[xAxis.idx] = remapFromXAxis(length,margin,xAxis,e.offsetX);
	noisePoint[yAxis.idx] = remapFromYAxis(length,margin,yAxis,e.offsetY);

	updateNoiseNumbers();

	drawCanvi();
}

function remapToXAxis(length,margin,axis, value) {
	if(axis === CONTINENTALNESS) {
		return margin + (length - 2*margin)*((value + 1.2)/2.2);
	} else if(axis === DEPTH) {
		return margin + (length - 2*margin)*((value + 1)/2.1);
	} else if(axis === WEIRDNESS && version == "26.2") {
		return margin + (length - 2*margin)*((value + 1.1)/2.2);
	} else {
		return margin + (length - 2*margin)*((value + 1)/2);
	}
}

function remapToYAxis(length,margin,axis, value) {
	if(axis === CONTINENTALNESS) {
		return (length-margin) - (length - 2*margin)*((value + 1.2)/2.2);
	} else if(axis === DEPTH) {
		return (length-margin) - (length - 2*margin)*((value + 1)/2.1);
	} else if(axis === WEIRDNESS && version == "26.2") {
		return (length-margin) - (length - 2*margin)*((value + 1.1)/2.1);
	} else {
		return (length-margin) - (length - 2*margin)*((value + 1)/2);
	}
}

function remapFromXAxis(length, margin, axis, value) {
	if(axis === CONTINENTALNESS) {
		return 2.2 * (value - margin)/(length - 2*margin) - 1.2;
	} else if(axis === DEPTH) {
		return 2.1 * (value - margin)/(length - 2*margin) - 1;
	} else if(axis === WEIRDNESS && version == "26.2") {
		return 2.1 * (value - margin)/(length - 2*margin) - 1.1;
	} else {
		return 2 * (value - margin)/(length - 2*margin) - 1;
	}
}

function remapFromYAxis(length, margin, axis, value) {
	if(axis === CONTINENTALNESS) {
		return 2.2 * ((length-margin) - value)/(length - 2*margin) - 1.2;
	} else if(axis === DEPTH) {
		return 2.1 * ((length-margin) - value)/(length - 2*margin) - 1;
		return (length-margin) - (length - 2*margin)*((value + 1)/2.1)
	} else if(axis === WEIRDNESS && version == "26.2") {
		return 2.1 * ((length-margin) - value)/(length - 2*margin) - 1.1;
	} else {
		return 2 * ((length-margin) - value)/(length - 2*margin) - 1;
	}
}

function drawCanvi(exception) {
	for(let i=0;i<canvases.length;i++) {
		if(canvases[i] === exception) continue;
		drawCanvas(canvasAxes[i].x,canvasAxes[i].y,canvases[i]);
	}
}

function onResize() {
	updateDocShape();
	drawCanvi();
}

function onSelectorChange(e,id,isX) {
	let newValue = Number.parseInt(e.target.value);
	let newNoise = noiseParams[newValue];

	if(isX) {
		canvasAxes[id].x = newNoise;
	} else {
		canvasAxes[id].y = newNoise;
	}

	drawCanvi();
	updateNoiseNumbers();
}

function onLoad() {
	window.onresize = onResize;

	for(let i=0;i<3;i++) {
		axisSelectors[i].x = document.getElementById(`axes${i}x`);
		axisSelectors[i].y = document.getElementById(`axes${i}y`);
		canvasAxes[i].x = noiseParams[Number.parseInt(axisSelectors[i].x.value)];
		canvasAxes[i].y = noiseParams[Number.parseInt(axisSelectors[i].y.value)];
		axisSelectors[i].x.onchange = (e) => {onSelectorChange(e,i,true);};
        	axisSelectors[i].y.onchange = (e) => {onSelectorChange(e,i,false);};
	}

	valueText = document.getElementById("values");

	for(let i=0;i<3;i++) {
		canvases[i] = document.getElementById(`canvas${i}`);
		canvases[i].onmousemove = onHoldCanvas;
	}
	updateDocShape();

	window.onmousedown = (e) => {mouseDown = true;};
	window.onmouseup = (e) => {mouseDown = false;};

	let overpassMono = new FontFace(
	  "Overpass Mono",
	  "url(https://fonts.gstatic.com/s/overpassmono/v21/_Xmq-H86tzKDdAPa-KPQZ-AC1i-0tg.woff2)"
	);
	
	overpassMono.load().then((font) => {
		document.fonts.add(font);
		drawCanvi();
	});
}

document.addEventListener("DOMContentLoaded", onLoad);
