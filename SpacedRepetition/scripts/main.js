// revision dates since item creation(in days)
let defaultRevisions = [
    0,
    1,
    2,
    3,
    4
].map(i => i * 24);

const btnNewCategory = document.querySelector('button.new-category');

//---------------------------------------------------------------------------//

let itemMarkup = null;
let categoryMarkup = null;

async function init() {
    itemMarkup = await fetch('markup/item.html').then(r => r.text());
    categoryMarkup = await fetch('markup/category.html').then(r => r.text());
    itemCheckMarkup = await fetch('markup/item_check.html').then(r => r.text());
    categories.init();
}


//---------------------------------------------------------------------------//

class Category {
    constructor(name) {
        this.name = name;
        this.parent = null;
        this.expanded = false;
        this.children = [];
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
        element.querySelector('.new-item').addEventListener('click', e => {
            addItem.open(this);
        });
        element.querySelector('.new-section').addEventListener('click', e => {
            addCategory.open(this);
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
        for (const child of this.children) child.shrink();
    }


    add(...children) {
        for (const child of children) {
            if (!(child instanceof Item) && !(child instanceof Category)) continue;
            if (child.parent instanceof Category) continue;
            this.children.push(child);
            this.element.querySelector('.items').appendChild(child.element);
            child.parent = this;
        }
        console.log(`Added ${children.length} item(s) to category ${this.name}.`);
    }

    remove(...children) {
        for (const child of children) {
            if (!(child instanceof Item) && !(child instanceof Category)) continue;
            const i = this.children.indexOf(child);
            this.children.splice(i, 1);
            this.element.querySelector('.items').removeChild(child.element);
            child.parent = null
        }
        console.log(`Removed ${children.length} item(s) from category ${this.name}`);
    }

    getData() {
        return {
            name: this.name,
            children: this.children.map(
                child => child.getData()
            )
        };
    }

    delete() {
        if (!this.parent) return;
        this.parent.remove(this);
    }
}


class Item {
    constructor(title, revisions=null, createdAt=null) {
        revisions = revisions ? revisions : defaultRevisions;
        this.revisions = [];
        //console.log(`Creating item with revisions: ${revisions}`);
        for (const revision of revisions) {
            //if(typeof revision === 'number') console.log(`Creating item that is a number, time: ${revision}`);
            //else console.log(`Creating revision, Time: ${revision.time} hours. Completed: ${revision.completed}`);
            this.revisions.push( typeof revision === 'number' ?
                new Revision(this, revision, false) :
                new Revision(this, revision.time, revision.completed)
            )
        }
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
        this.createChecklist();
        this.updateElement();
    }
    updateElement() {
        let date = new Date(this.createdAt);
        this.element.querySelector('.info .title').innerHTML = this.title;
        this.element.querySelector('.created-at > .value').innerHTML = date.toLocaleDateString();
        this.updateChecklist();
    }

    createChecklist() {
        const listElement = this.element.querySelector('.revisions');
        for (const revision of this.revisions) {
            revision.createElement();
            listElement.appendChild(revision.element);
        }
    }

    updateChecklist() {
        for (const revision of this.revisions) {
            revision.updateElement();
        }
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

    getData() {
        return {
            title: this.title,
            createdAt: this.createdAt,
            revisions: this.revisions.map(
                revision => revision.getData()
            )
        };
    }

    delete() {
        this.parent.remove(this);
    }

}


class Revision {
    constructor(parent, time, completed=false) {
        this.parent = parent;
        this.time = time;
        this.completed = completed;
        this.status = null;
        this.element = null;
    }

    createElement() {
        const element = document.createElement('li');
        element.classList.add('check-wrap');
        element.innerHTML = itemCheckMarkup;

        element.querySelector('.circle').addEventListener('click',
            e => this.clicked()
        );

        this.element = element;
    }

    updateElement() {
        let time = this.getTotalTime();
        const date = new Date(time);
        this.element.querySelector('.date')
            .innerHTML = date.toLocaleDateString();

        const status = this.getStatusByTime(time);
        this.setStatus(status);
    }

    getStatusByTime(time) {
        if (this.completed) return 'completed';

        const today = new Date();
        const start = today.setHours(0, 0, 0, 0);
        const end = today.setHours(23, 59, 59, 999);

        if (start <= time && time <= end) return 'today';
        if (time < start) return 'pending';
        return 'scheduled';
    }

    setStatus(status, text=null) {
        if (!text) text = this.getName(status);
        const itemCheck = this.element.querySelector('.item-check');
        this.element.querySelector('.status').innerHTML = text;
        itemCheck.setAttribute('status', status);
        this.status = status;
        this.completed = (this.status === 'completed');
        itemCheck.setAttribute('clickable', this.isClickable());
    }
    
    getName(status) {
        let days = (this.getTotalTime() - Date.now()) / 86400000;
        days = Math.ceil(Math.abs(days));
        switch (status) {
            case 'today': return 'Today';
            case 'scheduled':
                if (days > 1) return `In ${days} days`;
                return 'Tomorrow';
            case 'pending':
                if (days > 1) return `${days} days late`;
                return 'Yesterday';
            case 'completed':
                return 'Completed';
            default: return `${days}?`;
        }
    }

    getTotalTime() {
        return this.parent.createdAt + this.time * 3600000;
    }

    isClickable() {
        return (
            this.status === 'completed' ||
            this.status === 'today' ||
            this.status === 'pending'
        );
    }

    clicked() {
        const element = this.element.querySelector('.item-check');
        if (element.getAttribute('clickable') === 'false') return;
        
        if (this.completed) {
            this.completed = false;
            const status = this.getStatusByTime(this.getTotalTime());
            this.setStatus(status);
            return;
        }
        this.setStatus('completed');
    }

    getData() {
        return {
            time: this.time,
            completed: this.completed
        }
    }
}


//---------------------------------------------------------------------------//

let addItem = {
    element: document.querySelector('.modal.add-item'),
    inpTitle: document.querySelector('.modal.add-item .title'),
    btnAdd: document.querySelector('.modal.add-item .add'),
    btnCancel: document.querySelector('.modal.add-item .cancel'),
    

    open(parent) {
        this.parent = parent;
        this.element.classList.add('visible');
        this.inpTitle.focus();
    },
    
    close() {
        this.parent = null;
        this.element.classList.remove('visible');
        this.inpTitle.value = '';
    },


    clicked() {
        if (!this.valid()) {
            console.log("Invalid arguments.")
            return;
        }
        const title = this.inpTitle.value.trim();
        const item = categories.createItem(title);
        this.parent.expand();
        this.parent.add(item);
        this.close();
    },
    
    valid() {
        if (this.parent == null) return false;
        const title = this.inpTitle.value.trim();
        if (title === '') {
            console.log("Failed to create a new item. A title must be given.");
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
    parent: null,
    

    open(parent) {
        this.parent = parent;
        this.element.classList.add('visible');
        this.inpName.focus();
    },
    
    close() {
        this.inpName.value = '';
        this.parent = null;
        this.element.classList.remove('visible');
    },


    clicked() {
        if (!this.valid()) return;
        const name = this.inpName.value.trim().toLowerCase();
        const category = categories.createCategory(name);
        if (this.parent instanceof Category) this.parent.expand();
        this.parent.add(category);
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

    createItem(title, dates=null, createdAt=null) {
        return new Item(
            title,
            dates=dates,
            createdAt=createdAt
        );
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
        const startTime = Date.now();
        const data = JSON.parse(
            window.localStorage.getItem('categories') || '[]'
        );
        console.log(data);

        function create(object) {
            if (object.children) {
                const category = categories.createCategory(object.name);
                const children = object.children.map(
                    child => create(child)
                );
                category.add(...children);
                return category;
            }
            return categories.createItem(
                object.title,
                object.revisions,
                object.createdAt //- (86400000 * 4)
            );
        }
        for (const categoryData of data) {
            const category = create(categoryData);
            this.add(category);
        }
        const elapsed = Date.now() - startTime;
        console.log(`Loaded items from storage. Took ${Date.now() - startTime}ms.`);
    },
    
    save() {
        const data = this.categories.map(
            category => category.getData()
        );
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
    addCategory.open(categories);
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