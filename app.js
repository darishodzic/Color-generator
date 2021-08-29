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
let initialColors;
//Functions

//Color generator
function generateHex() {
	const hexColor = chroma.random();
	return hexColor;
}

function randomColors() {
	colorDivs.forEach((div, index) => {
		const hexText = div.children[0];
		const randomColor = generateHex();

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
	//update input colors
	saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
		0
	)},${scaleSat(1)})`;
}

randomColors();

generateBtn.addEventListener(
	"click",
	randomColors
);
