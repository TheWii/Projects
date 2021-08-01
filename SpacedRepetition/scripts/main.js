
// revision dates since item creation(in days)
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
}

//---------------------------------------------------------------------------//

const dates = {
    months: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December'
    ],
    weekdays: [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    ],

    format(dateObj, pattern='{MN} {DD}, {YYYY}') {
        if (!(dateObj instanceof Date)) dateObj = new Date(dateObj);
        const year = dateObj.getFullYear();
        const month = dateObj.getMonth() + 1;
        const monthDigit = month < 10 ? '0'+month : `${month}`;
        const monthName = this.months[month-1];
        const day = dateObj.getDate();
        const weekday = this.weekdays[dateObj.getDay()];
        return pattern
            .replace('{WD}', weekday)
            .replace('{DD}', day)
            .replace('{MN}', monthName)
            .replace('{MM}', monthDigit)
            .replace('{YYYY}', year);
    }
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
        element.querySelector('.dropdown .delete').addEventListener('click', e => {
            this.delete();
        });
        element.querySelector('.dropdown .new-item').addEventListener('click', e => {
            addItem.open(this);
        });
        element.querySelector('.dropdown .new-section').addEventListener('click', e => {
            addCategory.open(this);
        });
        element.querySelector('.dropdown .move-up').addEventListener('click', e => {
            this.move(-1);
        });
        element.querySelector('.dropdown .move-down').addEventListener('click', e => {
            this.move(1);
        });
        element.querySelector('.dropdown .edit').addEventListener('click', e => {
            this.edit();
        });


        this.element = element;
        this.updateElement();
    }

    updateElement() {
        this.element.querySelector('.name').innerHTML = this.name;
    }


    expand() {
        if (this.expanded) return;
        if (this.parent && this.parent.expand) this.parent.expand();
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

    moveChild(fromIndex, toIndex) {
        const maxIndex = this.children.length - 1;
        toIndex = Math.max(0, Math.min(toIndex, maxIndex));
        fromIndex = Math.max(0, Math.min(fromIndex, maxIndex));
        const item = this.children.splice(fromIndex, 1)[0];
        this.children.splice(toIndex, 0, item);
        this.resetList();
    }

    move(offset) {
        if (!this.parent || !this.parent.moveChild) return;
        const fromIndex = this.parent.children.indexOf(this);
        if (fromIndex == -1) return;
        let toIndex = fromIndex + offset;
        this.parent.moveChild(fromIndex, toIndex);
    }

    resetList() {
        const list = this.element.querySelector('.items');
        while(list.firstChild) list.removeChild(list.firstChild);
        for (const x of this.children) {
            x.element.firstChild.classList.add('no-animation');
            list.appendChild(x.element);
        }
    }

    getData() {
        return {
            name: this.name,
            children: this.children.map(
                child => child.getData()
            )
        };
    }

    edit() {
        editCategory.open(this);
    }

    delete() {
        if (!this.parent) return;
        this.parent.remove(this);
    }
}

class Item {
    constructor(title, revisions=null, startAt=null, createdAt=null) {
        revisions = revisions ? revisions : defaultRevisions;
        this.title = title;
        this.createdAt = createdAt ? createdAt : Date.now();
        this.startAt = startAt ? startAt : this.createdAt;
        this.expanded = false;
        this.parent = null;
        this.setRevisions(revisions);
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
        element.querySelector('.edit')
            .addEventListener('click', e => this.edit() );
        element.querySelector('.move-up')
            .addEventListener('click', e => this.move(-1) );
        element.querySelector('.move-down')
            .addEventListener('click', e => this.move(1) );
            
        this.element = element;
        this.createRevisionElements();
        this.updateElement();
    }
    updateElement() {
        this.element.querySelector('.info .title').innerHTML = this.title;
        this.element.querySelector('.created-at > .value')
            .innerHTML = dates.format(this.createdAt);
        this.element.querySelector('.start-at > .value')
            .innerHTML = dates.format(this.startAt);
        this.updateRevisionElements();
    }

    setRevisions(list) {
        if (!this.revisions) this.revisions = [];
        const revisions = [];
        for (let data of list) {
            if (typeof data === 'number')
                data = {time:data, completed:false};
            const prevRevision = this.revisions.filter(
                revision => revision.time === data.time
            )[0];
            if (prevRevision) data.completed = prevRevision.completed;
            revisions.push(
                new Revision(this, data.time, data.completed)
            );
        }
        this.revisions = revisions;
    }
    createRevisionElements() {
        const listElement = this.element.querySelector('.revisions');
        while(listElement.firstChild) {
            listElement.removeChild(listElement.firstChild);
        }
        for (const revision of this.revisions) {
            revision.createElement();
            listElement.appendChild(revision.element);
        }
    }
    updateRevisionElements() {
        for (const revision of this.revisions) {
            revision.updateElement();
        }
    }

    expand() {
        if (this.expanded) return;
        if (this.parent) this.parent.expand();
        this.expanded = true;
        this.element.querySelector('.item').classList.add('active');
    }

    shrink() {
        this.expanded = false;
        this.element.querySelector('.item').classList.remove('active');
    }

    move(offset) {
        if (!this.parent) return;
        const fromIndex = this.parent.children.indexOf(this);
        if (fromIndex == -1) return;
        let toIndex = fromIndex + offset;
        this.parent.moveChild(fromIndex, toIndex);
    }

    getData() {
        return {
            title: this.title,
            createdAt: this.createdAt,
            startAt: this.startAt,
            revisions: this.revisions.map(
                revision => revision.getData()
            )
        };
    }

    edit() {
        editItem.open(this);
    }

    delete() {
        this.parent.remove(this);
    }

}

class Revision {
    constructor(parent, time, completed=false) {
        this.status = null;
        this.element = null;
        this.parent = parent;
        this.time = time;
        completed = (completed && this.getTotalTime() <= Date.now());
        this.completed = completed;
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
            .innerHTML = dates.format(date);

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
        const date = new Date(this.getTotalTime());
        const now = new Date();
        let days = (this.getTotalTime() - now.getTime()) / 86400000;
        //console.log(`revision: ${this.getTotalTime()} | ${date.toLocaleString()}, now: ${now.getTime()} | ${now.toLocaleString()}, days: ${days}`);
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
        return this.parent.startAt + this.time * 3600000;
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
    inpStartDate: document.querySelector('.modal.add-item .start-date'),
    inpRepetitions: document.querySelector('.modal.add-item .repetition-number'),
    ulRepetitions: document.querySelector('.modal.add-item .repetitions'),
    btnAdd: document.querySelector('.modal.add-item .add'),
    btnCancel: document.querySelector('.modal.add-item .cancel'),
    repetitions: [],
    repsAmount: null,
    timeConversion: 24,

    init() {
        this.btnAdd.addEventListener("click", e => {
            e.preventDefault();
            this.clicked();
        });
        this.btnCancel.addEventListener("click", e => {
            e.preventDefault();
            this.close();
        });        
        this.inpRepetitions.addEventListener("input", e => {
            e.preventDefault();
            this.changedValues();
        });        
    },

    open(parent) {
        this.parent = parent;
        this.inpStartDate.value = dates.format(Date.now(), '{YYYY}-{MM}-{DD}');
        this.element.classList.add('visible');
        this.inpTitle.focus();
        this.changedValues();
    },
    
    close() {
        this.parent = null;
        this.element.classList.remove('visible');
        this.inpTitle.value = '';
    },

    changedValues() {
        let amount = parseInt(this.inpRepetitions.value);
        if (!amount) amount = 1;
        amount = Math.min(16, Math.max(1, amount));
        const create = this.repsAmount !== amount;
        this.repsAmount = amount;
        this.inpRepetitions.value = amount;
        this.repetitions = this.getRepetitions();
        if (create) this.createRepetitions();
        else this.updateRepetitions();
    },

    getRepetitions() {
        const list = this.ulRepetitions;
        const repetitions = [];
        for (let i=0; i<this.repsAmount; i++) {
            const li = list.children[i];
            let value;
            if (li) value = parseInt(li.querySelector('input').value) * this.timeConversion;
            if (!value) value = this.repetitions[i];
            if (!value) value = defaultRevisions[i];
            repetitions.push(value);
        }
        for (let i=0; i<repetitions.length; i++) {
            let value = Math.floor(repetitions[i] / this.timeConversion);
            if (i > 0) {
                const previous = Math.floor(repetitions[i-1] / this.timeConversion);
                value = Math.max(value, previous+1);
            }
            repetitions[i] = value * this.timeConversion;
        }
        //console.log(repetitions);
        return repetitions;
    },
    createRepetitions() {
        const list = this.ulRepetitions;
        const repetitions = this.repetitions;
        while (list.firstChild) list.removeChild(list.firstChild);
        for (let i=0; i<repetitions.length; i++) {
            const li = document.createElement('li');
            const input = document.createElement('input');
            input.addEventListener("input", e => {
                e.preventDefault();
                this.changedValues();
            });            
            input.type = 'number';
            const textBefore = document.createElement('span');
            textBefore.innerHTML = `${i+1}. IN `;
            const textAfter = document.createElement('span');
            textAfter.innerHTML = ` DAYS.`;
            li.appendChild(textBefore);
            li.appendChild(input);
            li.appendChild(textAfter);
            list.appendChild(li);
        }
        this.updateRepetitions();
    },
    updateRepetitions() {
        for (let i=0; i<this.repetitions.length; i++) {
            const li = this.ulRepetitions.children[i];
            if (!li) continue;
            const input = li.querySelector('input');
            input.value = Math.floor(this.repetitions[i] / 24).toString();
        }
    },


    clicked() {
        const data = this.parse();
        if (!data) return;
        const item = categories.createItem(data.title, data.repetitions, data.startAt);
        this.parent.expand();
        this.parent.add(item);
        this.close();
    },
    
    parse() {
        if (this.parent == null) return null;
        const title = this.inpTitle.value.trim();
        if (!title.length) {
            console.error("Failed to parse arguments for new item creation. A title must be given.");
            return null;
        }
        const start = this.inpStartDate.value;
        const startTime = start.length ? new Date(start).setHours(23, 59, 59, 999) : null;
        if (isNaN(startTime)) {
            console.error("Failed to parse arguments for new item creation. Date input is invalid.");
            return null;
        }
        const repetitions = this.getRepetitions();
        return {
            title: title,
            startAt: startTime,
            repetitions: repetitions
        };
    }
}

let editItem = {
    element: document.querySelector('.modal.edit-item'),
    inpTitle: document.querySelector('.modal.edit-item .title'),
    inpStartDate: document.querySelector('.modal.edit-item .start-date'),
    inpRepetitions: document.querySelector('.modal.edit-item .repetition-number'),
    ulRepetitions: document.querySelector('.modal.edit-item .repetitions'),
    btnEdit: document.querySelector('.modal.edit-item .edit'),
    btnCancel: document.querySelector('.modal.edit-item .cancel'),
    item: null,
    repetitions: [],
    repsAmount: null,

    init() {
        this.btnEdit.addEventListener("click", e => {
            e.preventDefault();
            this.clicked();
        });
        this.btnCancel.addEventListener("click", e => {
            e.preventDefault();
            this.close();
        });
        this.inpRepetitions.addEventListener("input", e => {
            e.preventDefault();
            this.changedValues();
        });  
    },
    
    open(item) {
        if (editItem.item) return;
        this.item = item;
        this.inpTitle.value = item.title;
        const date = new Date(item.startAt);
        this.inpStartDate.value = dates.format(date, '{YYYY}-{MM}-{DD}');
        console.log(this.inpStartDate.value);
        this.repetitions = item.revisions.map(x => x.time);
        this.repsAmount = this.item.revisions.length;
        this.inpRepetitions.value = this.repsAmount;
        this.createRepetitions();
        this.element.classList.add('visible');
    },
    
    close() {
        if (!editItem.item) return;
        this.item = null;
        this.element.classList.remove('visible');
        this.inpTitle.value = '';
        this.inpStartDate.value = '';
    },

    clicked() {
        const data = this.parse();
        //console.log(data);
        if (!data) return;
        this.item.title = data.title;
        if (data.startAt) this.item.startAt = data.startAt;
        this.item.setRevisions(data.repetitions);
        this.item.createRevisionElements();
        this.item.updateElement();
        this.close();
    },

    parse() {
        if (this.item == null) return null;
        const title = this.inpTitle.value.trim();
        if (!title.length) {
            console.error("Failed to parse arguments for new item creation. A title must be given.");
            return null;
        }
        const start = this.inpStartDate.value;
        console.log(`The start date: ${start}`);
        const startTime = start.length ? new Date(start).setHours(23, 59, 59, 999) : null;
        if (isNaN(startTime)) {
            console.error("Failed to parse arguments for new item creation. Date input is invalid.");
            return null;
        }
        const repetitions = this.getRepetitions();
        return {
            title: title,
            startAt: startTime,
            repetitions: repetitions
        };
    }
}
Object.setPrototypeOf(editItem, addItem);


let addCategory = {
    element: document.querySelector('.modal.add-category'),
    inpName: document.querySelector('.modal.add-category .name'),
    btnAdd: document.querySelector('.modal.add-category .add'),
    btnCancel: document.querySelector('.modal.add-category .cancel'),
    parent: null,

    init() {
        this.btnAdd.addEventListener("click", e => {
            e.preventDefault();
            this.clicked();
        });
        this.btnCancel.addEventListener("click", e => {
            e.preventDefault();
            this.close();
        });
    },

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
        const data = this.parse();
        if (!data) return;
        const category = categories.createCategory(data.name);
        if (this.parent instanceof Category) this.parent.expand();
        this.parent.add(category);
        this.close();
    },
    
    parse() {
        const name = this.inpName.value.trim();
        if (!name.length) {
            console.log("Failed to parse arguments. Name input is blank.");
            return null;
        }
        return {
            name: name
        };
    }
}

let editCategory = {
    element: document.querySelector('.modal.edit-category'),
    inpName: document.querySelector('.modal.edit-category .name'),
    btnEdit: document.querySelector('.modal.edit-category .edit'),
    btnCancel: document.querySelector('.modal.edit-category .cancel'),
    category: null,

    init() {
        this.btnEdit.addEventListener("click", e => {
            e.preventDefault();
            this.clicked();
        });
        this.btnCancel.addEventListener("click", e => {
            e.preventDefault();
            this.close();
        });
         
    },

    open(category) {
        if (this.category) return;
        this.category = category;
        this.inpName.value = category.name;
        this.element.classList.add('visible');
        this.inpName.focus();
    },
    
    close() {
        if (!this.category) return;
        this.category = null;
        this.element.classList.remove('visible');
        this.inpName.value = '';
    },

    clicked() {
        const data = this.parse();
        if (!data) return;
        this.category.name = data.name;
        this.category.updateElement();
        this.close();
    },
    
    parse() {
        if (this.category == null) return null;
        const name = this.inpName.value.trim();
        if (!name.length) {
            console.log("Failed to parse arguments. Name input is blank.");
            return null;
        }
        return {
            name: name
        };
    }
}


//---------------------------------------------------------------------------//

let categories = {
    element: document.querySelector('.categories'),
    children: [],
    observer: null,

    createItem(title, dates=null, startAt=null, createdAt=null) {
        return new Item(
            title,
            dates,
            startAt,
            createdAt
        );
    },

    moveChild(fromIndex, toIndex) {
        const maxIndex = this.children.length - 1;
        toIndex = Math.max(0, Math.min(toIndex, maxIndex));
        fromIndex = Math.max(0, Math.min(fromIndex, maxIndex));
        const item = this.children.splice(fromIndex, 1)[0];
        this.children.splice(toIndex, 0, item);
        this.resetList();
    },

    resetList() {
        while(this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        for (const x of this.children) {
            x.element.firstChild.classList.add('no-animation');
            this.element.appendChild(x.element);
        }
    },

    createCategory(name) {
        return new Category(name);
    },

    add(category) {
        if (!(category instanceof Category)) return;
        this.children.push(category);
        this.element.appendChild(category.element);
        category.parent = this;
    },

    remove(category) {
        if (!(category instanceof Category)) return;
        const i = this.children.indexOf(category);
        this.children.splice(i, 1);
        this.element.removeChild(category.element);
        category.parent = null;
    },

    get(name) {
        name = name.toLowerCase();
        for (const category of this.children) {
            if (category.name == name) return category;
        }
    },


    load() {
        const startTime = Date.now();
        const data = JSON.parse(
            window.localStorage.getItem('categories') || '[]'
        );
        //console.log(data);

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
                object.startAt,
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
        const data = this.children.map(
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


btnNewCategory.addEventListener("click", e => {
    e.preventDefault();
    addCategory.open(categories);
});

//---------------------------------------------------------------------------//

init();