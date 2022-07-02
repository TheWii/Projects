
console.log('Init.');

Vue.component('toast', {
    template: `
        <li>
            <div class="toast"
                :class="[
                    { disappear: isDisappearing },
                    getType
                ]"
                @click="clicked"
            >
                <div class="title">
                    {{ data.title }}
                </div>

                <div class="text">
                    {{ data.text }}
                </div>
            </div>
        </li>
    `,
    props: [ 'data' ],
    computed: {
        isDisappearing: function() {
            return this.data.disappear;
        },
        getType() {
            return this.data.type;
        }
    },
    methods: {
        clicked() {
            this.disappear();
        },
        
        remove() {
            this.$emit('remove', this.data);
        },

        disappear() {
            this.data.disappear = true;
            setTimeout(() => {
                this.remove();
            }, this.data.wait);
        }
    },
    mounted() {
        setTimeout(() => {
            this.disappear();
        }, this.data.duration);            
    }
});

Vue.component('toasts', {
    template: `
        <ul id="toasts">
            <toast
                v-for="toast in toasts"
                :key="toast.id"
                :data="toast"
                @remove="remove"
            ></toast>
        </ul>
    `,
    props: [ 'toasts' ],
    data: function() { return {
        nextId: 0,
        defaultDuration: 10000,
        defaultWait: 500,
        defaultType: 'info'
    }},
    watch: {
        toasts(list) {
            for (let toast of list) {
                if (!toast.prepared) this.prepare(toast);
            }
        }
    },
    methods: {
        getId() {
            return this.nextId++;
        },

        prepare(toast) {
            Vue.set(toast, 'id', this.getId());
            Vue.set(toast, 'duration', toast.duration || this.defaultDuration);
            Vue.set(toast, 'wait', toast.wait || this.defaultWait);
            Vue.set(toast, 'type', toast.type || this.defaultType);
            Vue.set(toast, 'disappear', false);            
            Vue.set(toast, 'prepared', true);
        },
        
        remove(toast) {
            const i = this.toasts.indexOf(toast);
            if (i >= 0) this.toasts.splice(i, 1);
        },
    }
});

const app = new Vue({
    el: '#app',
    data: {
        toasts: []
    },
    mounted() {
        console.log('App mounted!');
        this.toasts.push({
            type: 'success',
            title: 'Load',
            text: 'Page successfuly loaded.'
        })
    }
})


let messageModal = document.querySelector('#message');

document.querySelector('#open-message')
    .addEventListener('click', (e) => {
        e.preventDefault();
        messageModal.classList.add('visible');
});

messageModal.querySelector('.close')
    .addEventListener('click', (e) => {
        e.preventDefault();
        messageModal.classList.remove('visible');
});


let toasts = [
    {
        type: 'warning',
        title: 'Warning',
        text: 'Something went wrong, but we chose to ignore.'
    },
    {
        type: 'error',
        title: 'Error',
        text: 'Something definitely went wrong and we don\'t know how to solve it.'
    },
    {
        type: 'success',
        title: 'Success',
        text: 'Something went right for the first time!'
    },
    {
        type: 'info',
        title: 'Info',
        text: 'Everything seems fine.'
    },
];

document.querySelector('#show-toast')
    .addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Clicked show toast.');
        const i = Math.floor(Math.random() * toasts.length);
        app.toasts.push(Object.create(toasts[i]));
});