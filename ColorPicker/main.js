const hex = ['0', '1', '2', '3', '4', '5', '6', '7',
            '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'];

var slider_red = document.getElementById("slider-red");
var slider_green = document.getElementById("slider-green");
var slider_blue = document.getElementById("slider-blue");

slider_red.oninput = updateColor;
slider_green.oninput = updateColor;
slider_blue.oninput = updateColor;


class Color {
    constructor(red, green, blue) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    
    toHex() {
        return rgbToHex(this.red, this.green, this.blue);
    }
}


function updateColor() {
    let color = getColor()
    document.body.style.backgroundColor = color.toHex();
    document.querySelector(".color-hex").textContent = color.toHex();
    document.querySelector(".red-value").textContent = color.red.toString();
    document.querySelector(".green-value").textContent = color.green.toString();
    document.querySelector(".blue-value").textContent = color.blue.toString();
    slider_red.style.background = rgbToHex(color.red, 0, 0);
    slider_green.style.background = rgbToHex(0, color.green, 0);
    slider_blue.style.background = rgbToHex(0, 0, color.blue);
}

function pickColor() {
    let color = generateColor();
    setColor(color);
    updateColor();
}


function getColor() {
    return new Color(slider_red.value, slider_green.value, slider_blue.value);
}

function setColor(color) {
    slider_red.value = color.red;
    slider_green.value = color.green;
    slider_blue.value = color.blue;
}

function rgbToHex(red, green, blue) {
    return "#" + hex[Math.floor(red / 16)]
    + hex[red % 16]
    + hex[Math.floor(green / 16)]
    + hex[green % 16]
    + hex[Math.floor(blue / 16)]
    + hex[blue % 16];
}


function generateColor() {
    let red = getRandomNumber(255, true);
    let green = getRandomNumber(255, true);
    let blue = getRandomNumber(255, true);
    console.log(`Generated color: (${red}, ${green}, ${blue})`);
    return new Color(red, green, blue);
}

function getRandomNumber(range=1, integer=false) {
    let n = Math.random() * range;
    return integer ? Math.floor(n) : n; 
}


// Initially update the sliders
console.log("Init main script.");
pickColor();