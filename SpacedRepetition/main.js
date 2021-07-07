
const btnNewItem = document.querySelector('button.new-item');

const btnAdd = document.querySelector('.add-item-modal .add');
const btnCancel = document.querySelector('.add-item-modal .cancel');
const inpTitle = document.querySelector('.add-item-modal .title');
const inpCategory = document.querySelector('.add-item-modal .category');

let itemMarkup = null;

//---------------------------------------------------------------------------//

async function load() {
    itemMarkup = await fetch('markup/item.html').then(r => r.text());
    itemList.load();
}
load();

//---------------------------------------------------------------------------//

btnAdd.addEventListener("click", e => {
    e.preventDefault();
    addItem.clicked();
});

btnNewItem.addEventListener("click", e => {
    e.preventDefault();
    addItem.open();
});

btnCancel.addEventListener("click", e => {
    e.preventDefault();
    addItem.close();
});

//---------------------------------------------------------------------------//

class Item {
    constructor(title, category, createdAt=null) {
        this.expanded = false;
        this.title = title;
        this.category = category;
        this.createdAt = createdAt ? createdAt : Date.now();
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
        this.element.querySelector('.info .title').innerHTML = this.title;
        this.element.querySelector('.info .category').innerHTML = this.category;
    }


    expand() {
        if (this.expanded) return;
        for (let item of itemList.items) item.shrink();
        this.expanded = true;
        this.element.querySelector('.item').classList.add('active');
    }

    shrink() {
        this.expanded = false;
        this.element.querySelector('.item').classList.remove('active');
    }


    delete() {
        itemList.remove(this);
    }

}


let addItem = {
    element: document.querySelector('.add-item-modal'),
    
    open() {
        this.element.classList.add('visible');
        inpTitle.focus();
    },
    
    close() {
        inpTitle.value = '';
        this.element.classList.remove('visible');
    },

    clicked() {
        if (!this.valid()) {
            console.log("Invalid arguments.")
            return;
        }
        const name = inpTitle.value.trim();
        const category = inpCategory.value.trim();
        const item = itemList.createItem(name, category);
        itemList.add(item);
        this.close();
    },
    
    valid() {
        if (inpTitle.value.trim() === '') {
            return false;
        }
        if (inpCategory.value.trim() === '') {
            return false;
        }
        return true;
    },
}

//---------------------------------------------------------------------------//

let itemList = {
    element: document.querySelector('.items'),
    items: [],

    createItem(title, category, createdAt=null) {
        return new Item(title, category, createdAt);
    },
    
    add(item) {
        this.items.push(item);
        this.element.appendChild(item.element);
        this.save();
    },

    remove(item) {
        const i = this.items.indexOf(item);
        this.items.splice(i, 1);
        this.element.removeChild(item.element);
        this.save();
    },
    
    load() {
        let items = JSON.parse(
            window.localStorage.getItem('items') || '[]'
        );
        
        for (let item of items) {
            let obj = this.createItem(
                item.title,
                item.category,
                item.createdAt
            );
            this.add(obj);
        }
        
    },
    
    save() {
        const data = [];
        for (let item of this.items) {
            data.push({
                title: item.title,
                category: item.category,
                createdAt: item.createdAt
            });
        }
        const json = JSON.stringify(data);
        window.localStorage.setItem('items', json);
    }
}

//---------------------------------------------------------------------------//
