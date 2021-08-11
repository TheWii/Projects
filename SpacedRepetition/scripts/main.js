
// revision dates since item creation(in weeks)
let defaultRevisions = [
    1,
    2,
    3,
    4,
    6,
    8,
    10,
    12,
    16,
    20,
    24,
    28,
    33,
    38,
    43,
    48
].map(i => i * 168);

const btnNewCategory = document.querySelector('button.new-category');
const btnPendingRevs = document.querySelector('button.pending-revs');

//---------------------------------------------------------------------------//


let itemMarkup = null;
let categoryMarkup = null;
let itemCheckMarkup = null;

async function init() {
    itemMarkup = await fetch('markup/item.html').then(r => r.text());
    categoryMarkup = await fetch('markup/category.html').then(r => r.text());
    itemCheckMarkup = await fetch('markup/item_check.html').then(r => r.text());
    categories.init();
    addItem.init();
    editItem.init();
    addCategory.init();
    editCategory.init();
    pendingRevs.init();
}


//---------------------------------------------------------------------------//


btnNewCategory.addEventListener("click", e => {
    e.preventDefault();
    addCategory.open(categories);
});

btnPendingRevs.addEventListener("click", e => {
    e.preventDefault();
    pendingRevs.open(categories);
});


//---------------------------------------------------------------------------//


init();