
Vue.component('pricing-range', {
    template: `
    <input type="range"
        min="0"
        class="pricing-input"
        name="pricingRange"
        title="Pricing Range"
        aria-label="Pricing Range"
        :max="maxRange"
        v-model="value"
        @input="updated"
    >
    `,
    props: [ 'defaultValue' ],
    data: function() {
        const value = parseFloat(this.defaultValue) * 25;
        return {
            value: value.toString(),
            maxRange: 100
        }
    },
    methods: {
        updated(event) {
            const range = Math.floor(this.value / 25);
            this.$emit('updated', range);
        }
    }
})


Vue.component('billing', {
    template: `
        <div class="billing">
            <span>Monthly Billing</span>
            <label class="switch" title="Yearly Billing">
                <input type="checkbox" name="yearlyBilling"
                    v-model="isYearly"
                >
                <span class="slider"></span>
            </label>
            <span>Yearly Billing</span>
            <span class="discount">{{discountLabel}}</span>
        </div>
    `,
    props: [ 'checked', 'discount' ],
    data: function() {
        return {
            isYearly: this.checked
        }
    },
    computed: {
        discountLabel() {
            return (this.discount * 100).toFixed();
        }
    },
    watch: {
        isYearly(value) {
            this.$emit('updated', value);
        }
    }
})

const app = new Vue({
    el: '#app',
    data: function() {
        return {
            ranges: [
                { pageviews: '10K', price: 8.00},
                { pageviews: '50K', price: 12.00},
                { pageviews: '100K', price: 16.00},
                { pageviews: '500K', price: 24.00},
                { pageviews: '1M', price: 36.00},
            ],
            range: '2',
            price: '',
            pageviews: '',
            hasDiscount: false,
            discount: 0.25
        }
    },
    created: function() {
        this.update();
    },
    computed: {
        fprice() {
            return this.price.toFixed(2);
        }
    },
    methods: {
        getDiscount(price) {
            return price * (1 - this.discount);
        },

        update() {
            const plan = this.ranges[this.range];
            this.pageviews = plan.pageviews;
            this.price = this.hasDiscount ? this.getDiscount(plan.price) : plan.price;
        },

        updateRange(range) {
            this.range = range;
            this.update();
        },

        updateBilling(hasDiscount) {
            this.hasDiscount = hasDiscount;
            this.update();
        }
    }
})