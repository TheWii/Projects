

const btnNewItem = document.querySelector('button.new-item');
const btnNewCategory = document.querySelector('button.new-category');

//---------------------------------------------------------------------------//

let itemMarkup = null;
let categoryMarkup = null;

async function init() {
    itemMarkup = await fetch('markup/item.html').then(r => r.text());
    categoryMarkup = await fetch('markup/category.html').then(r => r.text());
    categories.init();
}


//---------------------------------------------------------------------------//

class Category {
    constructor(name) {
        this.name = name;
        this.parent = null;
        this.expanded = false;
        this.items = [];
        this.createElement();
    }

    createElement() {
        const element = document.createElement('li');
        element.classList.add('category-wrap');
        element.innerHTML = categoryMarkup;

        element.querySelector('a.expand').addEventListener('click', e => {
            this.expanded ? this.shrink() : this.expand();
        });
        element.querySelector('.delete').addEventListener('click', e => {
            this.delete();
        });

        this.element = element;
        this.updateElement();
    }

    updateElement() {
        this.element.querySelector('.name').innerHTML = this.name;
    }


    expand() {
        if (this.expanded) return;
        this.expanded = true;
        this.element.querySelector('.category').classList.add('active');
    }

    shrink() {
        this.expanded = false;
        this.element.querySelector('.category').classList.remove('active');
        for (const item of this.items) item.shrink();
    }


    add(...items) {
        for (const item of items) {
            if (!(item instanceof Item)) continue;
            if (item.category instanceof Category) continue;
            this.items.push(item);
            this.element.querySelector('.items').appendChild(item.element);
            item.parent = this;
        }
        console.log(`Added ${items.length} item(s) to category ${this.name}.`);
    }

    remove(...items) {
        for (const item of items) {
            if (!(item instanceof Item)) continue;
            const i = this.items.indexOf(item);
            this.items.splice(i, 1);
            this.element.querySelector('.items').removeChild(item.element);
            item.parent = null
        }
        console.log(`Removed ${items.length} item(s) from category ${this.name}`);
    }

    delete() {
        if (!this.parent) return;
        this.parent.remove(this);
    }
}


class Item {
    constructor(title, createdAt=null) {
        this.title = title;
        this.createdAt = createdAt ? createdAt : Date.now();
        this.expanded = false;
        this.parent = null;
        this.createElement();
    }


    createElement() {
        const element = document.createElement('li');
        element.classList.add('item-wrap');
        element.innerHTML = itemMarkup;
        
        element.querySelector('.expand').addEventListener('click', e => {
            this.expanded ? this.shrink() : this.expand()
        });
        
        element.querySelector('.delete')
            .addEventListener('click', e => this.delete() );
            
        this.element = element;
        this.updateElement();
    }

    updateElement() {
        let date = new Date(this.createdAt);
        this.element.querySelector('.info .title').innerHTML = this.title;
        this.element.querySelector('.created-at > .value').innerHTML = date.toLocaleDateString();
    }


    expand() {
        if (this.expanded) return;
        //for (const item of this.parent.items) item.shrink();
        this.expanded = true;
        this.element.querySelector('.item').classList.add('active');
    }

    shrink() {
        this.expanded = false;
        this.element.querySelector('.item').classList.remove('active');
    }


    delete() {
        this.parent.remove(this);
    }

}

//---------------------------------------------------------------------------//

let addItem = {
    element: document.querySelector('.modal.add-item'),
    inpTitle: document.querySelector('.modal.add-item .title'),
    inpCategory: document.querySelector('.modal.add-item .inp-category'),
    btnAdd: document.querySelector('.modal.add-item .add'),
    btnCancel: document.querySelector('.modal.add-item .cancel'),
    

    open() {
        this.element.classList.add('visible');
        this.inpTitle.focus();
    },
    
    close() {
        this.inpTitle.value = '';
        this.element.classList.remove('visible');
    },


    clicked() {
        if (!this.valid()) {
            console.log("Invalid arguments.")
            return;
        }
        const title = this.inpTitle.value.trim();
        const categoryName = this.inpCategory.value.trim();
        let category = categories.get(categoryName);
        const item = categories.createItem(title);
        category.expand();
        category.add(item);
        this.close();
    },
    
    valid() {
        const title = this.inpTitle.value.trim();
        const category = this.inpCategory.value.trim();
        if (title === '') {
            console.log("Failed to create a new item. A title must be given.");
            return false;
        }
        if (category === '') {
            console.log("Failed to create a new item. A category must be given.");
            return false;
        }
        if (!categories.get(category)) {
            console.log("Failed to create a new item. Such category doesn't exist.");
            return false;
        }
        return true;
    },
}

let addCategory = {
    element: document.querySelector('.modal.add-category'),
    inpName: document.querySelector('.modal.add-category .name'),
    btnAdd: document.querySelector('.modal.add-category .add'),
    btnCancel: document.querySelector('.modal.add-category .cancel'),
    

    open() {
        this.element.classList.add('visible');
        this.inpName.focus();
    },
    
    close() {
        this.inpName.value = '';
        this.element.classList.remove('visible');
    },


    clicked() {
        if (!this.valid()) return;
        const name = this.inpName.value.trim().toLowerCase();
        const category = categories.createCategory(name);
        categories.add(category);
        this.close();
    },
    
    valid() {
        const input = this.inpName.value.trim().toLowerCase();
        if (input === '') {
            console.log("Failed to create category. The input is blank.");
            return false;
        }
        if (categories.get(input)) {
            console.log("Failed to create category. A category with the same name already exists.");
            return false;
        }
        return true;
    },
}


//---------------------------------------------------------------------------//

let categories = {
    element: document.querySelector('.categories'),
    categories: [],
    observer: null,

    createItem(title, createdAt=null) {
        return new Item(title, createdAt);
    },

    createCategory(name) {
        return new Category(name);
    },
    

    add(category) {
        if (!(category instanceof Category)) return;
        this.categories.push(category);
        this.element.appendChild(category.element);
        category.parent = this
    },
    
    remove(category) {
        if (!(category instanceof Category)) return;
        const i = this.categories.indexOf(category);
        this.categories.splice(i, 1);
        this.element.removeChild(category.element);
        category.parent = null;
    },

    get(name) {
        name = name.toLowerCase();
        for (const category of this.categories) {
            if (category.name == name) return category;
        }
    },


    load() {
        const data = JSON.parse(
            window.localStorage.getItem('categories') || '[]'
        );
        console.log(data);

        for (let categoryData of data) {
            const items = categoryData.items.map(itemData =>
                this.createItem(
                    itemData.title,
                    itemData.createdAt
                )
            );
            const category = this.createCategory(categoryData.name);
            this.add(category);
            category.add(...items);
        }
        console.log(`Loaded items from storage.`);
    },
    
    save() {
        const data = [];
        for (let category of this.categories) {
            const items = category.items.map(item => ({
                title: item.title,
                createdAt: item.createdAt
            }));
            data.push({
                name: category.name,
                items: items
            });
        }

        const json = JSON.stringify(data);
        window.localStorage.setItem('categories', json);
        console.log(`Saved items to storage.`);
    },

    init() {
        this.load();

        this.observer = new MutationObserver(mutations => {
            this.save();
        });
        this.observer.observe(this.element, {
            subtree: true,
            childList: true
        });
    }
}


//---------------------------------------------------------------------------//

btnNewItem.addEventListener("click", e => {
    e.preventDefault();
    addItem.open();
});

addItem.btnAdd.addEventListener("click", e => {
    e.preventDefault();
    addItem.clicked();
});

addItem.btnCancel.addEventListener("click", e => {
    e.preventDefault();
    addItem.close();
});


btnNewCategory.addEventListener("click", e => {
    e.preventDefault();
    addCategory.open();
});

addCategory.btnAdd.addEventListener("click", e => {
    e.preventDefault();
    addCategory.clicked();
});

addCategory.btnCancel.addEventListener("click", e => {
    e.preventDefault();
    addCategory.close();
});


//---------------------------------------------------------------------------//

init();