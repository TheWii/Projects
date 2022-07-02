

const inpTerms = document.querySelector('#inp-terms');
inpTerms.value = convergence.length;

inpTerms.addEventListener('input', (e) => {
    const i = Number(inpTerms.value);
    convergence.createTerms(i);
    console.log(`Changed number of terms. (${i})`);
});