import { FlowNode } from "./node.js";

export default class FlowJS {
    containerElement: HTMLElement;
    parentElement: HTMLElement;
    nodeId: number = 0;
    nodes: FlowNode[] = [];
    private modalElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private currentZoom = 1;
    private elementScale = 20;
    private transformLevel = 0.002;
    private initialWidth: number;
    private initialHeight: number;
    private isOneNodeMoving = false;

    constructor(private el: HTMLElement) {
        console.log('flow', this);
        window['flow'] = this;
        if (!this.el) {
            throw new Error('Container element is required to be initiated with FlowJS class.');
        };
        this.parentElement = this.el;
        this.applyParentStyles();
        this.createContainer(this.el);
        this.setScrollPosition();
        this.createCanvasElement();
        this.handleZoom();
        this.handleScroll();
        this.createModal();
    }

    private createContainer(el: HTMLElement) {
        this.containerElement = document.createElement('div');
        el.appendChild(this.containerElement);
        this.containerElement.classList.add('fp-flowjs-container');
        this.initialWidth = this.parentElement.offsetWidth * this.elementScale;
        this.initialHeight = this.parentElement.offsetHeight * this.elementScale;
        this.containerElement.style.width = this.initialWidth + 'px';
        this.containerElement.style.height = this.initialHeight + 'px';
    }

    private createCanvasElement() {
        this.canvasElement = document.createElement('canvas');
        this.canvasElement.classList.add('fp-flowjs-canvas');
        this.containerElement.appendChild(this.canvasElement);
        this.canvasElement.width = this.containerElement.offsetWidth;
        this.canvasElement.height = this.containerElement.offsetHeight;
    }

    private applyParentStyles() {
        this.parentElement.classList.add('fp-flow-container');
        // Parent style on condition to handle default height
        if (!this.parentElement.offsetHeight) {
            this.parentElement.style.height = '100%';
        }
        this.parentElement.style.overflow = 'auto';
    }

    private handleScroll() {
        let isDragging = false;
        let startClientX = 0;
        let startClientY = 0;
        let scrollLeft: number;
        let scrollTop: number;

        this.containerElement.addEventListener('mousedown', (e) => {
            this.containerElement.style.cursor = 'grabbing';
            scrollLeft = this.parentElement.scrollLeft / this.currentZoom;
            scrollTop = this.parentElement.scrollTop / this.currentZoom;
            isDragging = true;
            startClientX = e.clientX;
            startClientY = e.clientY;
        });

        this.containerElement.addEventListener('mousemove', (e) => {
            if (isDragging && !this.isOneNodeMoving) {
                const newScrollLeft = (scrollLeft + startClientX - e.clientX) * this.currentZoom;
                const newScrollTop = (scrollTop + startClientY - e.clientY) * this.currentZoom;
                this.parentElement.scrollLeft = newScrollLeft;
                this.parentElement.scrollTop = newScrollTop;
            }
        });

        this.containerElement.addEventListener('mouseup', () => {
            if (this.isOneNodeMoving) {
                return;
            }
            isDragging = false;
            this.containerElement.style.cursor = 'initial';
        });
    }

    private setScrollPosition() {
        setTimeout(() => {
            this.parentElement.scrollTo({
                top: this.parentElement.scrollHeight / 2 - this.parentElement.offsetHeight / 2,
                left: this.parentElement.scrollWidth / 2 - this.parentElement.offsetWidth / 2
            });
        });
    }

    private createModal() {
        const modal = document.createElement('div');
        modal.classList.add('flow-modal-backdrop');
        const modalContent = document.createElement('div');
        modalContent.classList.add('flow-modal');
        modal.appendChild(modalContent);
        this.containerElement.appendChild(modal);
        this.modalElement = modal;
        modal.addEventListener('click', (e) => {
            modal.classList.remove('show');
            modalContent.innerHTML = '';
        });
        modalContent.addEventListener('click', (e) => e.stopPropagation());
    }

    /**
     * Add a node to the flow
     * @param el HTMLElement to show inside the node
     * @param name Name of the node
     */
    addNode = (el?: HTMLElement, name?: string): void => {
        console.log('addNode');
        const node = new FlowNode(this.nodeId, el, name);
        this.nodes.push(node);
        this.nodeId++;
        this.containerElement.appendChild(node.nodeElement);
        node.onRemove = this.removeNode;
        node.onConnection = this.connectNodes;
        node.drawConnections = this.drawConnections;
        const boundingClientRect = this.containerElement.getBoundingClientRect();
        const { left, top } = boundingClientRect;
        node.nodeElement.style.left = (left * (-1) / this.currentZoom) + 'px';
        node.nodeElement.style.top = (top * (-1) / this.currentZoom) + 'px';

        node.parentScrollPosition = () => {
            return { x: this.parentElement.scrollLeft, y: this.parentElement.scrollTop };
        }
        node.zoomPosition = () => {
            return this.currentZoom;
        };
        node.onNodeMove = (bool: boolean) => {
            this.isOneNodeMoving = bool;
        };
    }

    /**
     * Remove a node from the flow
     * @param nodeId The id of the node to remove
     */
    removeNode = (nodeId: number): void => {
        console.log('removeNode');
        const node = this.containerElement.querySelector(`.fp-flowjs-node-${nodeId}`);
        if (node) {
            this.containerElement.removeChild(node);
            this.nodes[nodeId] = null;
            this.drawConnections();
        }
    }

    /**
     * Connect two nodes
     * @param fromNode The id of the node to connect from
     */
    private connectNodes = (fromNode: FlowNode): void => {
        console.log('connectNodes');
        // Connect nodes logic here
        const el = document.createElement('div');
        el.classList.add('fp-flowjs-connections', 'fpf-overflow-scroll');
        const title = document.createElement('div');
        title.style.fontWeight = 'bold';
        title.style.marginBottom = '10px';
        title.innerText = 'Connect to';
        el.appendChild(title);
        const fromNodeId = fromNode.nodeId;

        this.nodes.forEach(node => {
            if (node && node.nodeId !== fromNodeId) {
                const nodeItem = document.createElement('div');
                nodeItem.classList.add('fp-flowjs-connection-item');
                nodeItem.innerText = node.nodeName;
                el.appendChild(nodeItem);
                nodeItem.addEventListener('click', () => {
                    this.drawConnection(fromNode, node);
                    this.modalElement.classList.remove('show');
                    this.modalElement.querySelector('.flow-modal').innerHTML = '';
                });
            }
        });

        this.modalElement.querySelector('.flow-modal').appendChild(el);
        this.modalElement.classList.add('show');
    }

    drawConnection(fromNode: FlowNode, toNode: FlowNode) {
        const existingConnection = fromNode.connections.find(c => c.nodeId === toNode.nodeId && c.type === 'out');

        if (existingConnection) {
            return;
        }
        this.drawLine(fromNode, toNode);
        fromNode.connections.push({ nodeId: toNode.nodeId, type: 'out' });
        toNode.connections.push({ nodeId: fromNode.nodeId, type: 'in' });
    }

    private drawConnections = () => {
        this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        this.nodes.forEach(node => {
            if (node) {
                node.connections.forEach(connection => {
                    if (connection.type === 'out') {
                        const toNode = this.nodes.find(n => n && n.nodeId === connection.nodeId);
                        if (toNode) {
                            this.drawLine(node, toNode);
                        }
                    }
                });
            }
        });
    }

    private drawLine(fromNode: FlowNode, toNode: FlowNode) {
        this.ctx.beginPath();
        this.ctx.moveTo(fromNode.centerX, fromNode.centerY);
        this.ctx.lineTo(toNode.centerX, toNode.centerY);
        this.ctx.strokeStyle = '#eeeeee';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    private get ctx() {
        return this.canvasElement.getContext('2d');
    }

    private handleZoom() {
        this.parentElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (!e.ctrlKey) {
                return; // Triggered by two finger scroll
            }
            const deltaY = e.deltaY;
            if (deltaY > 0) {
                this.currentZoom -= this.transformLevel;
            } else {
                this.currentZoom += this.transformLevel;
            }
            if (this.currentZoom < this.minZoom) {
                this.currentZoom = this.minZoom;
            }
            const translateX = this.initialWidth * (1 - this.currentZoom) / 2;
            const translateY = this.initialHeight * (1 - this.currentZoom) / 2;
            this.containerElement.style.transform = `scale(${this.currentZoom}) translate(${translateX}px, ${translateY}px)`;
        });
    }

    private get minZoom() {
        return Math.max(
            this.parentElement.clientWidth / this.initialWidth,
            this.parentElement.clientHeight / this.initialHeight
        );
    }
}

window['FlowJS'] = FlowJS;