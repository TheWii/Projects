
window.addEventListener('load', (e) => {
    const inputs = document.querySelectorAll('input[type="range"]');
    for (let input of inputs) {
        input.addEventListener('input', e => updateRangeInput(input));
    }
});

function updateRangeInput(input) {
    const value = (input.value - input.min) / (input.max - input.min) * 100;
    input.style.background = 'linear-gradient(to right, var(--full-slider-bar) 0%, var(--full-slider-bar) ' + value + '%, var(--empty-slider-bar) ' + value + '%, var(--empty-slider-bar) 100%)'
}