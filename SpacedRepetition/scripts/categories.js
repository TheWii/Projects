

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

    update() {
        this.updateElement();
        for (let child of this.children) child.update();
    }

    getLocation() {
        let location = '';
        if (this.parent && this.parent.getLocation)
            location = this.parent.getLocation() + ' / ';
        return location + this.name; 
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
            const i = this.children.remove(child);
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


//---------------------------------------------------------------------------//


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

    update() {
        this.updateElement();
        for (let revision of this.revisions) revision.update();
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
    nextRevision() {
        for (let revision of this.revisions) {
            if (!revision.completed) return revision;
        }
    }
    getProgress() {
        let completed = 0;
        for (let revision of this.revisions)
            if (revision.completed) completed++;
        return completed;
    }
    isComplete() {
        return !this.nextRevision();
    }
    getLocation() {
        return this.parent.getLocation();
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


//---------------------------------------------------------------------------//


class Revision {
    constructor(parent, time, completed=false) {
        this.status = null;
        this.element = null;
        this.parent = parent;
        this.time = time;
        completed = (completed && this.getTime() <= Date.now());
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
        let time = this.getTime();
        const date = new Date(time);
        this.element.querySelector('.date')
            .innerHTML = dates.format(date);

        const status = this.getStatusByTime(time);
        this.setStatus(status);
    }

    update() {
        this.updateElement();
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
        //console.log(`revision: ${this.getTime()} | ${date.toLocaleString()}, now: ${now.getTime()} | ${now.toLocaleString()}, days: ${days}`);
        const days = this.getDays();
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

    getDays() {
        const date = new Date(this.getTime());
        const today = new Date().setHours(0, 0, 0, 0);
        let days = (this.getTime() - today) / 86400000;
        return Math.ceil(Math.abs(days));
    }

    getTime() {
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
            const status = this.getStatusByTime(this.getTime());
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
        this.children.remove(category);
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

    update() {
        const then = Date.now();
        for (let child of this.children) child.update();
        const took = Date.now() - then;
        console.log(`Updated items. Took ${took}ms.`)
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

        //this.interval = window.setInterval(e => this.update(), 1000);
    }
}