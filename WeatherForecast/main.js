
const key = '4fea02d7a04a3b75e668650ae134bad7';

const form = document.querySelector('.top form');
const input = document.querySelector('.top input');
const label = document.querySelector('.top .label');
const cities = document.querySelector('.cities');
let inputValue;
const requestedCities = [];

form.addEventListener('submit', e => {
    e.preventDefault();
    search();
});


function search() {
    let name = input.value;
    input.value = '';

    let url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${key}&units=metric`;
    console.log(`Requesting: ${url}`);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (requestedCities.includes(data.id)) {
                label.innerHTML = `"${data.name}, ${data.sys.country}" is already present.`; 
                return;
            };
            createCard(data);
            requestedCities.push(data.id);
            label.innerHTML = '';
        })
        .catch(reason => {
            label.innerHTML = 'Please, search for a valid city!'
        });
}


function createCard(data) {
    let name = data.name;
    let country = data.sys.country;
    let temp = data.main.temp;
    let description = data.weather[0].description;
    const contents = `
        <h2 class='top'>
            <span class='name'>${name}</span>
            <sup class='country'>${country}</sup>
        </h2>
        <span class="temp">${temp}<sup>ºC</sup></span>
        <figure>
            <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="...">
            <figcaption>${description}</figcaption>
        </figure>
    `;
    
    let li = document.createElement('li');
    li.classList.add('city');
    li.innerHTML = contents;
    cities.appendChild(li);
}