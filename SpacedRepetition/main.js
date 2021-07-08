
const btnNewItem = document.querySelector('button.new-item');
const btnNewCategory = document.querySelector('button.new-category');

let itemMarkup = null;

//---------------------------------------------------------------------------//

async function load() {
    itemMarkup = await fetch('markup/item.html').then(r => r.text());
    itemList.load();
}
load();


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
    element: document.querySelector('.modal.add-item'),
    inpTitle: document.querySelector('.modal.add-item .title'),
    inpCategory: document.querySelector('.modal.add-item .category'),
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
        const name = this.inpTitle.value.trim();
        const category = this.inpCategory.value.trim();
        const item = itemList.createItem(name, category);
        itemList.add(item);
        this.close();
    },
    
    valid() {
        if (this.inpTitle.value.trim() === '') {
            return false;
        }
        if (this.inpCategory.value.trim() === '') {
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
        if (!this.valid()) {
            console.log("Invalid arguments.")
            return;
        }
        const name = this.inpName.value.trim();
        this.close();
    },
    
    valid() {
        if (this.inpName.value.trim() === '') {
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

    
    unsavedAdd(...items) {
        for (const item of items) {
            if (!(item instanceof Item)) continue;
            this.items.push(item);
            this.element.appendChild(item.element);
        }
        console.log(`Added ${items.length} item(s).`);
    },

    add(...items) {
        this.unsavedAdd(...items);
        this.save();
    },

    unsavedRemove(...items) {
        for (const item of items) {
            if (!(item instanceof Item)) continue;
            const i = this.items.indexOf(item);
            this.items.splice(i, 1);
            this.element.removeChild(item.element);
        }
        console.log(`Removed ${items.length} item(s).`)
    },

    remove(...items) {
        this.unsavedRemove(...items);
        this.save();
    },
    

    load() {
        const data = JSON.parse(
            window.localStorage.getItem('items') || '[]'
        );

        const items = data.map(item =>
            this.createItem(
                item.title,
                item.category,
                item.createdAt
            )
        );
        this.unsavedAdd(...items);
        console.log(`Loaded items from storage.`);
        
    },
    
    save() {
        const data = this.items.map(
            item => ({
                title: item.title,
                category: item.category,
                createdAt: item.createdAt
        }));
        const json = JSON.stringify(data);
        window.localStorage.setItem('items', json);
        console.log(`Saved items to storage.`);
    }
}

//---------------------------------------------------------------------------//

addItem.btnAdd.addEventListener("click", e => {
    e.preventDefault();
    addItem.clicked();
});


btnNewCategory.addEventListener("click", e => {
    e.preventDefault();
    addCategory.open();
});

addCategory.btnCancel.addEventListener("click", e => {
    e.preventDefault();
    addCategory.close();
});


btnNewItem.addEventListener("click", e => {
    e.preventDefault();
    addItem.open();
});

addItem.btnCancel.addEventListener("click", e => {
    e.preventDefault();
    addItem.close();
});
