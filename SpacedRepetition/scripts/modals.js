
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
        this.changedValues();
    },
    
    close() {
        this.parent = null;
        this.element.classList.remove('visible');
        this.inpTitle.value = '';
    },

    changedValues() {
        let amount = parseInt(this.inpRepetitions.value);
        if (!amount) amount = 4;
        if (amount > 159) amount = amount % 10;
        amount = Math.max(1, Math.min(amount, 16));
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
        const startDate = new Date(start);
        if (isNaN(startDate)) {
            console.error("Failed to parse arguments for new item creation. Date input is invalid.");
            return null;
        }
        const timeOffset = startDate.getTimezoneOffset() * 60000;
        let startTime = startDate.getTime() + timeOffset;
        startTime = new Date(startTime).setHours(23, 59, 59, 999);
        const repetitions = this.getRepetitions();
        return {
            title: title,
            startAt: startTime,
            repetitions: repetitions
        };
    }
}


//---------------------------------------------------------------------------//


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
        //console.log(date);
        //this.inpStartDate.value = dates.format(Date.now(), '{YYYY}-{MM}-{D}');
        this.inpStartDate.value = dates.format(date, '{YYYY}-{MM}-{DD}');
        //console.log(dates.format(date, '{YYYY}-{MM}-{DD}'));
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
        const startDate = new Date(start);
        if (isNaN(startDate)) {
            console.error("Failed to parse arguments for new item creation. Date input is invalid.");
            return null;
        }
        const timeOffset = startDate.getTimezoneOffset() * 60000;
        let startTime = startDate.getTime() + timeOffset;
        startTime = new Date(startTime).setHours(23, 59, 59, 999);
        const repetitions = this.getRepetitions();
        return {
            title: title,
            startAt: startTime,
            repetitions: repetitions
        };
    }
}
Object.setPrototypeOf(editItem, addItem);


//---------------------------------------------------------------------------//


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


//---------------------------------------------------------------------------//


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


let pendingRevs = {
    element: document.querySelector('.modal.pending-revs'),
    ulDays: document.querySelector('.modal.pending-revs .days'),
    btnClose: document.querySelector('.modal.pending-revs button.close'),
    parent: null,

    init() {
        this.element.addEventListener('click', e => {
            e.preventDefault();
            if (e.target === this.element) this.close();
        });
        this.btnClose.addEventListener('click', e => {
            e.preventDefault();
            this.close();
        });
    },

    open(parent) {
        this.parent = parent;
        this.update();
        this.element.classList.add('visible');
    },
    
    close() {
        this.parent = null;
        this.element.classList.remove('visible');
    },

    showItem(item) {
        this.close();
        item.expand();
        item.element.scrollIntoView();
    },

    update() {
        const then = Date.now();
        function getItems(object) {
            if (object.children) return object.children.map(
                child => getItems(child)
            );
            return object;
        }
        let items = getItems(this.parent).flat(Infinity);
        items = items.filter( item => !item.isComplete() );
        items = items.sort((a, b) =>
            a.nextRevision().getTime() - b.nextRevision().getTime()
        );
        //console.log(items);
        this.clear();
        this.createList(items);
        console.log(`Updated modal. Took ${Date.now() - then}ms.`)

    },

    clear() {
        const l = this.ulDays;
        while (l.firstChild) l.removeChild(l.firstChild);
    },

    createList(items) {
        const remaining = new Array(...items);
        while (remaining.length) {
            const time = remaining[0].nextRevision().getTime();
            const matched = remaining.filter(value =>
                value.nextRevision().getTime() === time
            );
            const element = this.createDay(time, matched);
            this.ulDays.appendChild(element);    
            remaining.remove(...matched);
        }
    },

    createDay(time, items) {
        const element = document.createElement('li');
        element.classList.add('day');

        const top = document.createElement('div');
        top.classList.add('top');
        element.appendChild(top);

        const title = document.createElement('span');
        title.classList.add('title');
        title.innerHTML = dates.format(new Date(time));
        top.appendChild(title);
        
        const ulRevisions = document.createElement('ul');
        ulRevisions.classList.add('revisions');
        for (let item of items) {
            ulRevisions.appendChild(
                this.createRevision(item)
            );
        }
        element.appendChild(ulRevisions);
        return element;
    },

    createRevision(item) {
        const revision = item.nextRevision();
        const element = document.createElement('li');
        element.classList.add('revision');
        element.setAttribute('status', revision.status);
        element.addEventListener('click', e => {
            e.preventDefault();
            this.showItem(item);

        });

        const icon = document.createElement('span');
        icon.classList.add('icon');
        const label = document.createElement('span');
        const labelText = document.createTextNode(
            `${item.getProgress()}/${item.revisions.length}`
        );
        label.appendChild(labelText);
        icon.appendChild(label);
        element.appendChild(icon);
        
        const info = document.createElement('div');
        info.classList.add('info');
        element.appendChild(info);
        
        const title = document.createElement('span');
        title.classList.add('title');
        title.innerHTML = item.title;
        info.appendChild(title);
        
        const location = document.createElement('span');
        location.classList.add('location');
        location.innerHTML = item.getLocation();
        info.appendChild(location);
        
        return element;
    }
}