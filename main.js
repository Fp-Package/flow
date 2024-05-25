import { Node } from "./node.js";

export class Flow {

    canvasStartX = 0;
    canvasStartY = 0;
    canvasTranslateX = 0;
    canvasTranslateY = 0;
    canvas = null;
    canvasEl = null;
    lastScale = 1;
    lastZoomDirection = null;
    zoomTollerance = { min: 1, max: 5 };
    zoomScale = 0.05;
    isDragging = false;
    maxTranslateXAllowed = 0;
    maxTranslateYAllowed = 0;
    ctx = null;
    nodes = [];
    isNodeDragging = false;
    strokeColor = 'white';
    strokeWidth = 1;
    element = null;

    constructor() {
        this.element = document.querySelector('.fp-flow-container');
        this.canvas = document.createElement('div');
        this.canvas.id = 'fp-flow-canvas';
        this.canvas.classList.add('fp-flow-container-inner');
        this.element.appendChild(this.canvas);
        this.canvasEl = document.createElement('canvas');
        this.canvasEl.id = 'lineCanvas';
        this.canvasEl.classList.add('line-canvas');
        this.canvas.appendChild(this.canvasEl);
        this.canvasEl.width = this.canvas.offsetWidth;
        this.canvasEl.height = this.canvas.offsetHeight;
        this.ctx = this.canvasEl.getContext('2d');
        this.init();
        // Handle parent scroll behaviour
    }

    drawLine(x1, y1, x2, y2) {
        // console.log('x1:', x1, 'y1:', y1, 'x2:', x2, 'y1:', y2);
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        // this.ctx.lineTo(x1, y2);
        this.ctx.lineTo(x2, y2);
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.lineWidth = this.strokeWidth / this.lastScale;
        this.ctx.stroke();
    };

    refreshCanvas() {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        const connectedNodes = [];
        this.nodes.forEach((nodeItem) => {
            nodeItem.connectedNodes.forEach((connectedNode) => {
                const node1 = nodeItem;
                const node2 = this.nodes.find((node) => node.id === connectedNode);
                const connection = node1.id > node2.id ? `${node2.id}-${node1.id}` : `${node1.id}-${node2.id}`;
                if (connectedNodes.includes(connection)) {
                    return;
                }
                this.drawLine(node1.centerX, node1.centerY, node2.centerX, node2.centerY);
                connectedNodes.push(connection);
            });
        });
    }

    addNode(element) {
        const id = Math.max(...this.nodes.map((node) => node.id), 0) + 1;
        const node = new Node(element, id);
        this.canvas.appendChild(element);
        node.containerElement = this.element;
        const elementCenterX = this.canvasTranslateX + this.element.offsetWidth / 2 - element.offsetWidth / 2;
        const elementCenterY = this.canvasTranslateY + this.element.offsetHeight / 2 - element.offsetHeight / 2;
        element.style.transform = `scale(${1 / this.lastScale})`;
        element.style.left = `${elementCenterX}px`;
        element.style.top = `${elementCenterY}px`;

        this.nodes.push(node);

        node.onNodeMoveStart((e) => {
            this.isNodeDragging = true;
        });

        node.onNodeMove((x, y) => {
            this.refreshCanvas();
        });

        node.onNodeMoveEnd((e) => {
            this.isNodeDragging = false;
        });

        return node;
    }

    removeNode(nodeId) {
        const node = this.nodes.find((node) => node.id === nodeId);
        node.element.remove();
        this.nodes = this.nodes.filter((node) => node.id !== nodeId);
        this.nodes.forEach((node) => {
            node.connectedNodes = node.connectedNodes.filter((connectedNode) => connectedNode !== nodeId);
        });
        this.refreshCanvas();
    }

    addConnection(node1Id, node2Id) {
        node1Id = parseInt(node1Id);
        node2Id = parseInt(node2Id);
        const node1Instance = this.nodes.find((node) => node.id === node1Id);
        const node2Instance = this.nodes.find((node) => node.id === node2Id);
        if (!(node1Instance.connectedNodes.includes(node2Id) || node2Instance.connectedNodes.includes(node1Id))) {
            node1Instance.connectedNodes.push(node2Id);
            node2Instance.connectedNodes.push(node1Id);
        }
        this.refreshCanvas();
    }

    removeConnection(node1Id, node2Id) {
        node1Id = parseInt(node1Id);
        node2Id = parseInt(node2Id);
        const node1Instance = this.nodes.find((node) => node.id === node1Id);
        const node2Instance = this.nodes.find((node) => node.id === node2Id);
        node1Instance.connectedNodes = node1Instance.connectedNodes.filter((node) => node !== node2Id);
        node2Instance.connectedNodes = node2Instance.connectedNodes.filter((node) => node !== node1Id);
        this.refreshCanvas();
    }

    init() {
        this.canvas.addEventListener('mousedown', (e) => {
            if (this.isNodeDragging) return;
            this.canvas.style.cursor = 'grabbing';
            this.canvasStartX = e.clientX;
            this.canvasStartY = e.clientY;
            this.isDragging = true;
        });
        this.canvas.addEventListener('mousemove', (e) => {
            e.preventDefault();
            if (!this.isDragging || this.isNodeDragging) return;
            const canvasNewX = e.clientX;
            const canvasNewY = e.clientY;
            const diffX = canvasNewX - this.canvasStartX;
            const diffY = canvasNewY - this.canvasStartY;
            this.canvasTranslateX += diffX;
            this.canvasTranslateY += diffY;
            this.canvasStartX = canvasNewX;
            this.canvasStartY = canvasNewY;
            if (this.canvasTranslateX > this.maxTranslateXAllowed) {
                this.canvasTranslateX = this.maxTranslateXAllowed;
            }
            if (this.canvasTranslateX < -this.maxTranslateXAllowed) {
                this.canvasTranslateX = -this.maxTranslateXAllowed;
            }
            if (this.canvasTranslateY > this.maxTranslateYAllowed) {
                this.canvasTranslateY = this.maxTranslateYAllowed;
            }
            if (this.canvasTranslateY < -this.maxTranslateYAllowed) {
                this.canvasTranslateY = -this.maxTranslateYAllowed;
            }
            this.canvas.style.transform = `translate(${this.canvasTranslateX}px, ${this.canvasTranslateY}px) scale(${this.lastScale})`;
        });
        this.canvas.addEventListener('mouseup', (e) => {
            this.canvas.style.cursor = 'initial';
            this.isDragging = false;
        });

        this.canvas.addEventListener('wheel', (e) => {
            // console.log(e);
            e.preventDefault();
            e.stopPropagation();
            if (!e.ctrlKey) {
                // Triggered by two finger scroll
                return;
            }
            const delta = e.wheelDelta;
            const zoomDirection = (delta / 120) > 0 ? 'zoomout' : 'zoomin';
            if (this.lastZoomDirection === 'zoomout' && zoomDirection === 'zoomout' && this.lastScale >= this.zoomTollerance.max) {
                return;
            }
            if (this.lastZoomDirection === 'zoomin' && zoomDirection === 'zoomin' && this.lastScale <= this.zoomTollerance.min) {
                return;
            }
            this.lastScale += zoomDirection === 'zoomout' ? this.zoomScale : this.zoomScale * -1;
            this.lastZoomDirection = zoomDirection;
            if (this.lastScale < 1) {
                this.lastScale = 1;
            } this.maxTranslateXAllowed = (this.canvas.offsetWidth * this.lastScale - this.canvas.offsetWidth) / 2;
            this.maxTranslateYAllowed = (this.canvas.offsetHeight * this.lastScale - this.canvas.offsetHeight) / 2;
            this.nodes.forEach((node) => {
                node.element.style.transform = `scale(${1 / this.lastScale})`;
                node.canvasScale = this.lastScale;
                node.setCenter();
            });
            this.canvas.style.transform = `scale(${this.lastScale})`;
            this.refreshCanvas();
        });
    }

    getRenditionInfo() {
        const info = {};
        const mainReusableProps = [
            "nodes",
            "canvasTranslateX",
            "canvasTranslateY",
            "lastScale",
            "canvasStartX",
            "canvasStartY",
            "strokeColor",
            "strokeWidth"
        ];
        mainReusableProps.forEach((prop) => {
            info[prop] = this[prop];
        });
        const nodeReusableProps = [
            "startX",
            "startY",
            "data",
            "id",
            "connectedNodes"
        ];
        info.nodes = info.nodes.map((node) => {
            const nodeInfo = {};
            nodeReusableProps.forEach((prop) => {
                nodeInfo[prop] = node[prop];
            });
            return nodeInfo;
        });
        return info;
    }

    renderSavedFlow(data) {
        for (const key in data) {
            if (key !== 'nodes') {
                this[key] = data[key];
            }
        }
        this.canvas.style.transform = `translate(${this.canvasTranslateX}px, ${this.canvasTranslateY}px) scale(${this.lastScale})`;
        data.nodes.forEach((node) => {
            const element = node.element || document.createElement('div');
            const newNode = this.addNode(element);
            for (const key in node) {
                newNode[key] = node[key];
            }
            element.style.left = `${node.startX * this.lastScale}px`;
            element.style.top = `${node.startY * this.lastScale}px`;
            if (!node.element) {
                element.innerText = `Node ${node.id}`;
            }
        });
        setTimeout(() => {
            this.refreshCanvas();
        });
    }

}

window.Flow = Flow;
// fetch('main.css')
//   .then(response => response.text())
//   .then(cssText => {
//     const styleEl = document.createElement('style');
//     styleEl.textContent = cssText;
//     document.head.appendChild(styleEl);
//   })