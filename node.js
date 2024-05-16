export class Node {
    startX = 0;
    startY = 0;
    element = null;
    mousemoveHandler = this.mousemove.bind(this);
    mouseupHandler = this.mouseup.bind(this);
    nodeMoveCb = null;
    centerX = 0;
    centerY = 0;
    data = {};
    id = null;
    connectedNodes = [];
    nodeMoveStartCb = null;
    nodeMoveEndCb = null;
    canvasScale = 1;

    constructor(element, id) {
        this.element = element;
        element.classList.add('node');
        element.id = 'fpfn - ' + id;
        this.id = id;
        this.element.addEventListener('mousedown', this.mousedown.bind(this));
        setTimeout(() => {
            this.setCenter();
        }, 0);
    };

    setCenter() {
        const { offsetHeight, offsetWidth, offsetLeft, offsetTop } = this.element;
        const centerX = offsetLeft + offsetWidth / 2;
        const centerY = offsetTop + offsetHeight / 2;
        // console.log(`Node ${this.id}`, centerX, centerY)
        this.centerX = centerX;
        this.centerY = centerY;
        if (this.nodeMoveCb) {
            this.nodeMoveCb(this.centerX, this.centerY);
        }
    };

    mousedown(e) {
        this.startX = e.clientX / this.canvasScale;
        this.startY = e.clientY / this.canvasScale;
        this.nodeMoveStartCb(this.centerX, this.centerY);
        document.addEventListener('mousemove', this.mousemoveHandler);
        document.addEventListener('mouseup', this.mouseupHandler);
    };

    mousemove(e) {
        const clientX = e.clientX / this.canvasScale;
        const clientY = e.clientY / this.canvasScale;
        e.preventDefault();
        const newX = this.startX - clientX;
        const newY = this.startY - clientY;
        // console.log(newX, newY, this.startX - clientX, this.startY - clientY)

        this.startY = clientY;
        this.startX = clientX;

        const left = this.element.offsetLeft - newX;
        const top = this.element.offsetTop - newY;
        this.element.style.left = left + 'px';
        this.element.style.top = top + 'px';
        this.setCenter();
    };

    mouseup(e) {
        document.removeEventListener('mousemove', this.mousemoveHandler);
        document.removeEventListener('mouseup', this.mouseupHandler);
        this.nodeMoveEndCb(this.centerX, this.centerY);
    };

    onNodeMove(cb) {
        this.nodeMoveCb = cb;
        this.nodeMoveCb(this.centerX, this.centerY);
    };

    onNodeMoveStart(cb) {
        this.nodeMoveStartCb = cb;
    };

    onNodeMoveEnd(cb) {
        this.nodeMoveEndCb = cb;
    };
}