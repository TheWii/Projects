

const dropdown = {
    windowClick(event) {
        const target = event.target;
        if (target.matches('.dropdown button')) {
            console.log("Clicked at button...");
            const element = target.parentElement;
            dropdown.clicked(element);
            dropdown.closeAll(element);
            return;
        }
        dropdown.closeAll();
    },

    clicked(element) {
        element.classList.toggle('active');
    },

    closeAll(...exceptions) {
        const elements = document.querySelectorAll('.dropdown');
        elements.forEach( e => {
            if (exceptions.includes(e)) return;
            e.classList.remove('active');
        });
    }
}

window.onclick = dropdown.windowClick;