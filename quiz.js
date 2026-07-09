let currentQuestionID = 0;

let responses = [
];

let questionHeader;
let infoDiv;
let responseDiv;

let dropdown1;

let slider1;

let button;

function updateDocShape() {
	let usableAreaElem = document.getElementById("usableArea");
	let minDimension = Math.min(window.innerHeight,window.innerWidth);
	usableAreaElem.style.width = `${minDimension}px`;
	usableAreaElem.style.height = `${minDimension}px`;
}

function onResize() {
	updateDocShape();
}

function allQuestionReqFulfilled() {
	switch(currentQuestionID) {
		case 0:
			if(dropdown1.value !== "") return true;
			return false;
		case 1:
			return true;
	}
	return false;
}

function writeResponse() {
	switch(currentQuestionID) {
		case 0:
			responses[currentQuestionID] = {
				dropdownAns: dropdown1.value
			};
			break;
		case 1:
			responses[currentQuestionID] = {
				clicked: button.clicked,
				slider: slider1.value
			}
			break;
	}
	return;
}

function clearUI() {
	questionHeader.innerText = "";
	infoDiv.innerHTML = "";
	let responseDivChildren = Array.from(responseDiv.children);
	for(let i=0;i<responseDivChildren.length;i++) {
		if(responseDivChildren[i].id === "submit-button") continue;
		responseDiv.removeChild(responseDivChildren[i]);
	}
}

function prependRespDiv(node) {
	responseDiv.insertBefore(node,responseDiv.children[0]);
}

function showEnd() {
	questionHeader.innerText = "YOU ARE A WINN!!";
	
	let usableArea = document.getElementById("usableArea");
	usableArea.removeChild(responseDiv);
	
	let text = document.createElement("h2");
	text.innerText = "You haz the the winns";

	infoDiv.appendChild(text);

	let responsesTxt = document.createElement("p");
	responsesTxt.innerText = responses.toString();
	infoDiv.appendChild(responsesTxt);
}

function rebuildUI() {
	clearUI();

	switch(currentQuestionID) {
		case 0:
			questionHeader.innerText = "Answer the question now you coward:";
			const imgNode = document.createElement("img");
			infoDiv.appendChild(imgNode);
			
			dropdown1 = document.createElement("select");

			const none = document.createElement("option");
			none.value = "";
			none.innerText = "";
			none.selected = true;
			const yes = document.createElement("option");
			yes.value = "y";
			yes.innerText = "Yes";
			const no = document.createElement("option");
			no.value = "n";
			no.innerText = "No";

			dropdown1.appendChild(none);
			dropdown1.appendChild(yes);
			dropdown1.appendChild(no);
			prependRespDiv(dropdown1);
			break;
		case 1:
			questionHeader.innerText = "Woah a slider!!!";

			const infoText = document.createElement("h2");
			infoText.innerText = "Hello yes I'm real text do you want to go skamtebords";
			infoDiv.appendChild(infoText);

			slider1 = document.createElement("input");
			slider1.type = "range";
			slider1.min = "-1";
			slider1.max = "1";
			slider1.value = "0";
			slider1.step = "1";
			slider1.classList.add("slider");
			prependRespDiv(slider1);

			button = document.createElement("button");
			button.innerText = "Button";
			button.clicked = false;
			button.onclick = (e) => {e.target.clicked = true;}
			prependRespDiv(button);

			break;
		default:
			showEnd();
			break;
	}
}

function submit() {
	if(allQuestionReqFulfilled()) {
		writeResponse();

		currentQuestionID++;
		rebuildUI();
	} else {
		alert("Fill in all the necessary fields");
	}
}

function onLoad() {
	updateDocShape();
	let submitButton = document.getElementById("submit-button");
	submitButton.onclick = submit;
	questionHeader = document.getElementById("question-txt");
	infoDiv = document.getElementById("info-div");
	responseDiv = document.getElementById("response-div");
	rebuildUI();
}

document.addEventListener("DOMContentLoaded", onLoad);
window.onresize = onResize;
