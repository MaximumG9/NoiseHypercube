const DIVISION_COUNT = 8;
const TEXT_DIVISION_COUNT = 4;

let canvas;

let sliders = [];

let sliderValues = [
	0,
	0,
	0,
	0
];

let sliderParams = [
	1,
	2,
	3,
	4
];

let noiseParams = [
	{
		key:"T",
		name:"Temperature"
	},
	{
		key:"H",
		name:"Humidity"
	},
	{
		key:"E",
		name:"Erosion"
	},
	{
		key:"C",
		name:"Continentalness"
	},
	{
		key:"D",
		name:"Depth"
	},
	{
		key:"W",
		name:"Weirdness"
	}
];

let xAxis = 0;
let yAxis = 5;

let xAxisDropdown;
let yAxisDropdown;

let invalid = false;

function updateDocShape() {
	if(!invalid) updateSliderText();

	let length = Math.min(window.innerHeight,window.innerWidth);
	canvas.width = length;
	canvas.height = length;
	canvas.style.left = `${(window.innerWidth-length)/2}px`;
}

function updateSliderText() {
	for(let i=0; i<sliders.length;i++) {
		sliders[i].children[0].innerText = `${noiseParams[sliderParams[i]].name}(${sliderValues[i].toFixed(2)})`;
	}
}

function onResize() {
	updateDocShape();
	updateCanvas();
}

function updateCanvas() {
	let ctx = canvas.getContext("2d");

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	
	let length = canvas.width;
	
	if(invalid) {
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

	let xParam = noiseParams[xAxis];
	let yParam = noiseParams[yAxis];

	let axisMargin = 0.075;

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
	
	let xNameMeasure = ctx.measureText(xParam.name);

	ctx.fillText(xParam.name,
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
	
	let yNameMeasure = ctx.measureText(yParam.name);

	ctx.save();

	ctx.rotate(0.5 * Math.PI);
	ctx.fillText(yParam.name,
		(length - remapToXAxis(length,closeMargin,yAxis,0)) - (yNameMeasure.width/2),
		- (fontHeight * 0.5)
	);
	
	ctx.restore();

	// Draw biomes
	
	let biomesToDraw = [];

dataLoop:
	for(let i=0;i<biomeData.length;i++) {
sliderLoop:
		for(let j=0;j<sliderParams.length;j++) {
			let bounds = biomeData[i][noiseParams[sliderParams[j]].key];
			
			if(noiseParams[sliderParams[j]].key === noiseParams[4].key && sliderValues[j] < 0 && bounds[0] === bounds[1] && bounds[0] === 0) continue sliderLoop;
			
			if(sliderValues[j] < bounds[0] || sliderValues[j] > bounds[1]) continue dataLoop;
		}
		biomesToDraw.push(biomeData[i]);
	}

	let biomeFontHeight = insideLength * 0.01;

	ctx.font = `${biomeFontHeight}px Overpass Mono`;

	for(let i=0;i<biomesToDraw.length;i++) {
		let xBounds = biomesToDraw[i][xParam.key];
		let yBounds = biomesToDraw[i][yParam.key];

		let colour = biomeColours[biomesToDraw[i]["id"]];
		
		let minX = remapToXAxis(length, closeMargin,xAxis,xBounds[0]);
		let minY = remapToYAxis(length, closeMargin,yAxis,yBounds[1]); 

		let width = remapToXAxis(length,closeMargin,xAxis,xBounds[1]) - 
			remapToXAxis(length,closeMargin,xAxis,xBounds[0]);
		let height = remapToYAxis(length,closeMargin,yAxis,yBounds[0]) - 
			remapToYAxis(length,closeMargin,yAxis,yBounds[1]);

		if(width == 0 || height == 0) {
			ctx.beginPath();
			ctx.strokeStyle = colour;
			ctx.moveTo(minX,minY);
			ctx.lineTo(minX + width, minY + height);
			ctx.stroke();
		}

		ctx.fillStyle = colour;
		
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

		let dim = ctx.measureText(name);

		ctx.fillText(
			name,
			minX + width/2 - dim.width/2,
			minY + height/2 - biomeFontHeight/2,
		);
	}
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function remapToXAxis(length,margin,axis, value) {
	if(axis === 3) { // Continentalness
		return margin + (length - 2*margin)*((value + 1.2)/2.2)
	} else if(axis === 4) { // Depth
		return margin + (length - 2*margin)*((value + 1)/2.1)
	} else {
		return margin + (length - 2*margin)*((value + 1)/2)
	}
}

function remapToYAxis(length,margin,axis, value) {
	if(axis === 3) { // Continentalness
		return (length-margin) - (length - 2*margin)*((value + 1.2)/2.2)
	} else if(axis === 4) { // Depth
		return (length-margin) - (length - 2*margin)*((value + 1)/2.1)
	} else {
		return (length-margin) - (length - 2*margin)*((value + 1)/2)
	}
}

function mapFromXValue(length,margin,axis,x) {
}

function mapFromYValue(length,margin,axis,y) {
}

function recalculateSlider(id,e) {
	sliderValues[id] = e.target.valueAsNumber;
	updateSliderText();
	updateCanvas();
}

function recalculateAllSliders() {
	if(invalid) return;
	for(let i=0;i<sliders.length;i++) {
		sliderValues[i] = sliders[i].children[1].valueAsNumber;
	}
}

function updateSliderParams() {
	if(xAxis === yAxis) {
		invalid = true;
		return;
	} else {
		invalid = false;
	}
	let j=0;
	for(let i=0;i<noiseParams.length;i++) {
		if(i === xAxis) continue;
		if(i === yAxis) continue;
		sliderParams[j] = i;
		j++;
	}
}

function onLoad() {
	for(let i=0;i<4;i++) {
		sliders.push(document.getElementById(`slide${i}`));
		sliders[i].children[1].oninput = (newSlide) => {recalculateSlider(i,newSlide);};
	}

	xAxisDropdown = document.getElementById("xAxis");

	yAxisDropdown = document.getElementById("yAxis");

	xAxisDropdown.onchange = (e) => {
		xAxis = Number.parseInt(e.target.value);
		
		updateSliderParams();
				
		recalculateAllSliders();
		updateDocShape();
		updateCanvas();
	};
	xAxis = Number.parseInt(xAxisDropdown.value);
	yAxis = Number.parseInt(yAxisDropdown.value);

	updateSliderParams();
				
	recalculateAllSliders();

	canvas = document.getElementById("visual");

	yAxisDropdown.onchange = (e) => {
		yAxis = Number.parseInt(e.target.value);
		
		updateSliderParams();
				
		recalculateAllSliders();
		updateDocShape();
		updateCanvas();
	};


	let myFont = new FontFace(
	  "Overpass Mono",
	  "url(https://fonts.gstatic.com/s/overpassmono/v21/_Xmq-H86tzKDdAPa-KPQZ-AC1i-0tg.woff2)"
	);

	myFont.load().then((font) => {
		document.fonts.add(font);
		console.log("Font loaded");
		updateCanvas();
	});

	updateDocShape();
}

document.addEventListener("DOMContentLoaded",onLoad);
window.onresize = onResize;
