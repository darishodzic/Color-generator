//Global selections and variables
const colorDivs =
	document.querySelectorAll(".color");
const generateBtn =
	document.querySelector(".generate");
const sliders =
	document.querySelectorAll(
		'input[type="range"]'
	);
const currentHexes =
	document.querySelectorAll(
		".color h2"
	);
const popup = document.querySelector(
	".copy-container"
);
const adjustButton =
	document.querySelectorAll(".adjust");
const closeAdjustments =
	document.querySelectorAll(
		".close-adjustment"
	);
const lockButton =
	document.querySelectorAll(".lock");
const sliderContainers =
	document.querySelectorAll(".slider");

let initialColors;

//this is for local storage

let savedPalettes = [];

//add event listeners

generateBtn.addEventListener(
	"click",
	randomColors
);

sliders.forEach((slider) => {
	slider.addEventListener(
		"input",
		hslControl
	);
});

colorDivs.forEach((slider, index) => {
	slider.addEventListener(
		"change",
		() => {
			updateTextUi(index);
		}
	);
});

currentHexes.forEach((hex) => {
	hex.addEventListener("click", () => {
		copyToClipboard(hex);
	});
});

popup.addEventListener(
	"transitionend",
	() => {
		const popupBox = popup.children[0];
		popup.classList.remove("active");
		popupBox.classList.remove("active");
	}
);

adjustButton.forEach(
	(button, index) => {
		button.addEventListener(
			"click",
			() => {
				openAdjustmentPanel(index);
			}
		);
	}
);

closeAdjustments.forEach(
	(close, index) => {
		close.addEventListener(
			"click",
			() => {
				closeAdjustmentPanel(index);
			}
		);
	}
);

lockButton.forEach((button, index) => {
	button.addEventListener(
		`click`,
		() => {
			addLockClass(button, index);
		}
	);
});

//FUNCTIONS

//Color generator
function generateHex() {
	const hexColor = chroma.random();
	return hexColor;
}

function addLockClass(button, index) {
	colorDivs[index].classList.toggle(
		`locked`
	);
	lockButton[
		index
	].children[0].classList.toggle(
		`fa-lock-open`
	);
	lockButton[
		index
	].children[0].classList.toggle(
		`fa-lock`
	);
}

function randomColors() {
	initialColors = [];
	colorDivs.forEach((div, index) => {
		const hexText = div.children[0];
		const randomColor = generateHex();
		//add it to array
		if (
			div.classList.contains("locked")
		) {
			initialColors.push(
				hexText.innerText
			);
			return;
		} else {
			initialColors.push(
				chroma(randomColor).hex()
			);
		}
		//add the coloro to the bg
		div.style.backgroundColor =
			randomColor;
		hexText.innerText = randomColor;
		//check contrast
		checkTextContrast(
			randomColor,
			hexText
		);
		//initial colorize sliders
		const color = chroma(randomColor);
		const sliders =
			div.querySelectorAll(
				".slider input"
			);
		const hue = sliders[0];
		const brightness = sliders[1];
		const saturation = sliders[2];
		colorizeSliders(
			color,
			hue,
			brightness,
			saturation
		);
	});
	//reset inputs
	resetInputs();
	//check for button contrast
	adjustButton.forEach(
		(button, index) => {
			checkTextContrast(
				initialColors[index],
				button
			);
			checkTextContrast(
				initialColors[index],
				lockButton[index]
			);
		}
	);
}

function checkTextContrast(
	color,
	text
) {
	const luminance =
		chroma(color).luminance();
	if (luminance > 0.5) {
		text.style.color = "black";
	} else {
		text.style.color = "white";
	}
}

function colorizeSliders(
	color,
	hue,
	brightness,
	saturation
) {
	//scale saturation
	const noSat = color.set("hsl.s", 0);
	const fullSat = color.set("hsl.s", 1);
	const scaleSat = chroma.scale([
		noSat,
		color,
		fullSat,
	]);
	//scale brightness
	const midBright = color.set(
		"hsl.l",
		0.5
	);
	const scaleBright = chroma.scale([
		"black",
		midBright,
		"white",
	]);

	//update input colors
	saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
		0
	)},${scaleSat(1)})`;

	brightness.style.backgroundImage = `linear-gradient(to right,${scaleBright(
		0
	)},${scaleBright(0.5)},${scaleBright(
		1
	)})`;

	hue.style.backgroundImage = `linear-gradient(to right,rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControl(e) {
	const index =
		e.target.getAttribute(
			"data-bright"
		) ||
		e.target.getAttribute("data-sat") ||
		e.target.getAttribute("data-hue");
	let slider =
		e.target.parentElement.querySelectorAll(
			'input[type="range"]'
		);
	const hue = slider[0];
	const brightness = slider[1];
	const saturation = slider[2];

	const bgColor = initialColors[index];

	let color = chroma(bgColor)
		.set("hsl.s", saturation.value)
		.set("hsl.l", brightness.value)
		.set("hsl.h", hue.value);
	colorDivs[
		index
	].style.backgroundColor = color;

	//colorize sliders
	colorizeSliders(
		color,
		hue,
		brightness,
		saturation
	);
}

function updateTextUi(index) {
	const activeDiv = colorDivs[index];
	const color = chroma(
		activeDiv.style.backgroundColor
	);
	const textHex =
		activeDiv.querySelector("h2");
	const icons =
		activeDiv.querySelectorAll(
			".controls button"
		);
	textHex.innerText = color.hex();
	//check contrast
	checkTextContrast(color, textHex);
	for (i = 0; i < icons.length; i++) {
		checkTextContrast(color, icons[i]);
	}
}

function resetInputs() {
	const slider =
		document.querySelectorAll(
			".sliders input"
		);
	sliders.forEach((slider) => {
		if (slider.name === "hue") {
			const hueColor =
				initialColors[
					slider.getAttribute(
						"data-hue"
					)
				];
			const hueValue =
				chroma(hueColor).hsl()[0];
			slider.value =
				Math.floor(hueValue);
		}
		if (slider.name === "brightness") {
			const brightColor =
				initialColors[
					slider.getAttribute(
						"data-bright"
					)
				];
			const brightValue = chroma(
				brightColor
			).hsl()[2];
			slider.value =
				Math.floor(brightValue * 100) /
				100;
		}
		if (slider.name === "saturation") {
			const satColor =
				initialColors[
					slider.getAttribute(
						"data-sat"
					)
				];
			const satValue =
				chroma(satColor).hsl()[1];
			slider.value =
				Math.floor(satValue * 100) /
				100;
		}
	});
}

function copyToClipboard(hex) {
	const el =
		document.createElement("textarea");
	el.value = hex.innerText;
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);
	//Pop up animations
	const popopBox = popup.children[0];
	popup.classList.add("active");
	popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
	sliderContainers[
		index
	].classList.toggle("active");
}

function closeAdjustmentPanel(index) {
	sliderContainers[
		index
	].classList.remove("active");
}

//implement save to palette and local storage stuff
const saveBtn =
	document.querySelector(".save");
const submitSave =
	document.querySelector(
		".submit-save"
	);
const closeSave =
	document.querySelector(".close-save");
const saveContainer =
	document.querySelector(
		".save-container"
	);
const saveInput =
	document.querySelector(
		".save-container input"
	);

//event listeners
saveBtn.addEventListener(
	"click",
	openPalette
);

closeSave.addEventListener(
	"click",
	closePalette
);

submitSave.addEventListener(
	"click",
	savePalette
);

function openPalette(e) {
	const popup =
		saveContainer.children[0];
	saveContainer.classList.add("active");
	popup.classList.add("active");
}

function closePalette(e) {
	const popup =
		saveContainer.children[0];
	saveContainer.classList.remove(
		"active"
	);
	popup.classList.remove("active");
}

function savePalette(e) {
	saveContainer.classList.remove(
		"active"
	);
	popup.classList.remove("active");
	const name = saveInput.value;
	const colors = [];
	currentHexes.forEach((hex) => {
		colors.push(hex.innerText);
	});
	//generate object
	let paletteNr = savedPalettes.length;
	const paletteObj = {
		name,
		colors,
		nr: paletteNr,
	};
	savedPalettes.push(paletteObj);
	//Save to local storage
	saveToLocal(savedPalettes);
	saveInput.value = "";
}

function saveToLocal(savedPalettes) {
	let localPalettes;
	if (
		localStorage.getItem("palettes") ===
		null
	) {
		localPalettes = [];
	} else {
		localPalettes = JSON.parse(
			localStorage.getItem("palettes")
		);
	}

	localStorage.setItem(
		"palettes",
		JSON.stringify(savedPalettes)
	);
}

randomColors();
