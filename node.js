export class Node {
    startX = 0;
    startY = 0;
    newX = 0;
    newY = 0;
    element = null;
    mousemoveHandler = this.mousemove.bind(this);
    mouseupHandler = this.mouseup.bind(this);
    cb = null;
    centerX = 0;
    centerY = 0;
    data = {};
    id = null;
    connectedNodes = [];

    constructor(element, id) {
        this.element = element;
        element.classList.add('node');
        element.id = 'fpfn - ' + id;
        this.id = id;
        this.element.addEventListener('mousedown', this.mousedown.bind(this));
        this.setCenter();
    };

    setCenter() {
        const rect = this.element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        this.centerX = centerX;
        this.centerY = centerY;
    };

    mousedown(e) {
        this.startX = e.clientX;// - card.getBoundingClientRect().left;
        this.startY = e.clientY;// - card.getBoundingClientRect().top;
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('mouseup', this.mouseupHandler);
    };

    mousemove(e) {
        this.newX = this.startX - e.clientX;
        this.newY = this.startY - e.clientY;

        this.startX = e.clientX;
        this.startY = e.clientY;

        const top = this.element.offsetLeft - this.newX;
        const left = this.element.offsetTop - this.newY;
        this.element.style.left = top + 'px';
        this.element.style.top = left + 'px';
        this.setCenter();
        this.cb(this.centerX, this.centerY);
    };

    mouseup() {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('mouseup', this.mouseupHandler);
    };

    onNodeMove(cb) {
        this.cb = cb;
        this.cb(this.centerX, this.centerY);
    };
}