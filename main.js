import { Node } from "./node.js";

let canvasStartX = 0, canvasStartY = 0, canvasNewX = 0, canvasNewY = 0;
let canvasTranslateX = 0, canvasTranslateY = 0;
const canvas = document.getElementById('canvas');
const canvasEl = document.getElementById('lineCanvas');
canvasEl.width = canvas.offsetWidth;
canvasEl.height = canvas.offsetHeight;
let lastScale = 1;
let lastZoomDirection = null;
const zoomTollerance = { min: 1, max: 3 };
const zoomScale = 0.05;
let isDragging = false;
let maxTranslateXAllowed = 0;
let maxTranslateYAllowed = 0;
const ctx = canvasEl.getContext('2d');
const node1 = new Node('node1');
const node2 = new Node('node2');

const drawLine = (x1, y1, x2, y2) => {
    // console.log('x1:', x1, 'y1:', y1, 'x2:', x2, 'y1:', y2);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
};

node1.onNodeMove((x, y) => {
    //console.log('node1', x, y);
    drawLine(x, y, node2.centerX, node2.centerY);
});

node2.onNodeMove((x, y) => {
    //console.log('node2', x, y);
    drawLine(x, y, node1.centerX, node1.centerY);
});

canvas.addEventListener('mousedown', (e) => {
    canvas.style.cursor = 'grabbing';
    canvasStartX = e.clientX;
    canvasStartY = e.clientY;
    isDragging = true;
});
canvas.addEventListener('mousemove', (e) => {
    e.preventDefault();
    if (!isDragging) return;
    canvasNewX = e.clientX;
    canvasNewY = e.clientY;
    const diffX = canvasNewX - canvasStartX;
    const diffY = canvasNewY - canvasStartY;
    canvasTranslateX += diffX;
    canvasTranslateY += diffY;
    canvasStartX = canvasNewX;
    canvasStartY = canvasNewY;
    if (canvasTranslateX > maxTranslateXAllowed) {
        canvasTranslateX = maxTranslateXAllowed;
    }
    if (canvasTranslateX < -maxTranslateXAllowed) {
        canvasTranslateX = -maxTranslateXAllowed;
    }
    if (canvasTranslateY > maxTranslateYAllowed) {
        canvasTranslateY = maxTranslateYAllowed;
    }
    if (canvasTranslateY < -maxTranslateYAllowed) {
        canvasTranslateY = -maxTranslateYAllowed;
    }
    canvas.style.transform = `translate(${canvasTranslateX}px, ${canvasTranslateY}px) scale(${lastScale})`;
});
canvas.addEventListener('mouseup', (e) => {
    canvas.style.cursor = 'initial';
    isDragging = false;
});

canvas.addEventListener('wheel', (e) => {
    // console.log(e);
    e.preventDefault();
    if (!e.ctrlKey) {
        // Triggered by two finger scroll
        return;
    }
    const delta = e.wheelDelta;
    const zoomDirection = (delta / 120) > 0 ? 'zoomout' : 'zoomin';
    if (lastZoomDirection === 'zoomout' && zoomDirection === 'zoomout' && lastScale >= zoomTollerance.max) {
        return;
    }
    if (lastZoomDirection === 'zoomin' && zoomDirection === 'zoomin' && lastScale <= zoomTollerance.min) {
        return;
    }
    lastScale += zoomDirection === 'zoomout' ? zoomScale : zoomScale * -1;
    lastZoomDirection = zoomDirection;
    maxTranslateXAllowed = (canvas.offsetWidth * lastScale - canvas.offsetWidth) / 2;
    maxTranslateYAllowed = (canvas.offsetHeight * lastScale - canvas.offsetHeight) / 2;
    if (lastScale < 1) {
        lastScale = 1;
    }
    canvas.style.transform = `scale(${lastScale})`;
});