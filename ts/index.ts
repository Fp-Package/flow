import { FlowData, FlowNodeData } from "./flow.interface.js";
import { FlowNode } from "./node.js";

export default class FlowJS {
    containerElement: HTMLElement;
    nodes: FlowNode[] = [];
    private nextNodeId: number = 0;
    private modalElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private currentZoom = 1;
    private elementScale = 10;
    private transformLevel = 0.01;
    private initialWidth: number;
    private initialHeight: number;
    private isOneNodeMoving = false;
    private lineWidth = 1;
    private mouseMoveTimer: any;
    private readonly MOUSE_MOVE_DELAY = 3000;
    private readonly LINE_COLOR = '#f95c57';

    constructor(private parentElement: HTMLElement, private savedFlowData?: FlowData) {
        console.log('flow', this);
        window['flow'] = this;
        if (!this.parentElement) {
            throw new Error('Container element is required to be initiated with FlowJS class.');
        };
        this.parentElement = this.parentElement;
        this.applyParentStyles();
        this.createContainer(this.parentElement);
        this.setScrollPosition();
        this.createCanvasElement();
        this.handleZoom();
        this.handleScroll();
        this.createModal();
        if (savedFlowData) {
            this.setSavedFlow();
        }
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

            this.parentElement.classList.add('add-scrolls');
            clearTimeout(this.mouseMoveTimer);
            this.mouseMoveTimer = setTimeout(() => {
                this.parentElement.classList.remove('add-scrolls');
            }, this.MOUSE_MOVE_DELAY);

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

        this.parentElement.addEventListener('scroll', () => {
            this.parentElement.classList.add('add-scrolls');
            clearTimeout(this.mouseMoveTimer);
            this.mouseMoveTimer = setTimeout(() => {
                this.parentElement.classList.remove('add-scrolls');
            }, this.MOUSE_MOVE_DELAY);

            this.watchMinMaxScroll()
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
        this.parentElement.appendChild(modal);
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
    addNode(el?: HTMLElement, name?: string): FlowNode {
        console.log('addNode');
        const node = this.setNewNode(this.nextNodeId, el, name);
        this.nextNodeId++;
        return node;
    }

    private setNewNode(nodeId: number, el?: HTMLElement, name?: string): FlowNode {
        const node = new FlowNode(nodeId, el, name);
        this.nodes.push(node);
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
        return node;
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
     * Set the flow with saved data
     * @param flowInfo The saved flow data
     */
    private setSavedFlow() {
        this.savedFlowData.nodes = this.savedFlowData.nodes.sort((a, b) => a.nodeId - b.nodeId);
        this.savedFlowData.nodes.forEach(nodeData => {
            if (nodeData) {
                const node = this.setNewNode(nodeData.nodeId, null, nodeData.nodeName);
                node.metaData = nodeData.metaData;
                node.connections = nodeData.connections;
                node.nodeElement.style.left = (nodeData.centerPercentage.x * this.containerElement.offsetWidth) + 'px';
                node.nodeElement.style.top = (nodeData.centerPercentage.y * this.containerElement.offsetHeight) + 'px';
            }
        });
        this.nextNodeId = this.savedFlowData.nextNodeId || 0;
        this.drawConnections();
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

    private drawConnection(fromNode: FlowNode, toNode: FlowNode) {
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
        this.ctx.strokeStyle = this.LINE_COLOR;
        this.ctx.lineWidth = this.lineWidth / this.currentZoom;
        this.ctx.stroke();

        this.drawArrow(fromNode, toNode);
    }

    private get ctx() {
        return this.canvasElement.getContext('2d');
    }

    private handleZoom() {
        this.parentElement.addEventListener('wheel', (e) => {
            if (!e.ctrlKey) {
                return; // Triggered by two finger scroll
            }
            e.preventDefault();
            requestAnimationFrame(() => {
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
                this.watchMinMaxScroll();
            });
            this.drawConnections();
        });
    }

    private drawArrow(fromNode: FlowNode, toNode: FlowNode) {
        const mid = { x: (fromNode.centerX + toNode.centerX) / 2, y: (fromNode.centerY + toNode.centerY) / 2 };
        const angle = Math.atan2(toNode.centerY - fromNode.centerY, toNode.centerX - fromNode.centerX);
        const ctx = this.canvasElement.getContext('2d');

        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(mid.x, mid.y);
        ctx.lineTo(
            mid.x - arrowLength * Math.cos(angle - Math.PI / 6),
            mid.y - arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            mid.x - arrowLength * Math.cos(angle + Math.PI / 6),
            mid.y - arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = this.LINE_COLOR;
        ctx.fill();
    }

    private get minZoom() {
        return Math.max(
            this.parentElement.clientWidth / this.initialWidth,
            this.parentElement.clientHeight / this.initialHeight
        );
    }

    private watchMinMaxScroll() {
        if (this.currentZoom < 1) {
            const zoomDiff = 1 - this.currentZoom;
            const minScrollWidth = this.containerElement.offsetWidth * zoomDiff;
            const minScrollHeight = this.containerElement.offsetHeight * zoomDiff;
            const minScrollLeftAllowed = Math.ceil(minScrollWidth);
            const minScrollTopAllowed = Math.ceil(minScrollHeight);
            const maxScrollLeftAllowed = (this.parentElement.scrollWidth - this.parentElement.offsetWidth) * this.currentZoom;
            const maxScrollTopAllowed = (this.parentElement.scrollHeight - this.parentElement.offsetHeight) * this.currentZoom;
            if (this.parentElement.scrollLeft < minScrollLeftAllowed) {
                this.parentElement.scrollLeft = minScrollLeftAllowed;
            }
            if (this.parentElement.scrollLeft > maxScrollLeftAllowed) {
                this.parentElement.scrollLeft = maxScrollLeftAllowed;
            }
            if (this.parentElement.scrollTop < minScrollTopAllowed) {
                this.parentElement.scrollTop = minScrollTopAllowed;
            }
            if (this.parentElement.scrollTop > maxScrollTopAllowed) {
                this.parentElement.scrollTop = maxScrollTopAllowed;
            }
        }
    }

    get flowInfo(): FlowData {
        const nodesData: FlowNodeData[] = [];
        this.nodes.forEach(node => {
            if (node) {
                const { connections, metaData, nodeName, nodeId, centerX, centerY } = node;
                const centerPercentage = {
                    x: centerX / this.containerElement.offsetWidth,
                    y: centerY / this.containerElement.offsetHeight
                }
                nodesData.push({ connections, metaData, nodeName, nodeId, centerPercentage });
            }
        });

        return {
            nodes: nodesData,
            nextNodeId: this.nextNodeId
        };
    }

    setDefaultZoom() {
        this.currentZoom = 1;
        this.containerElement.style.transform = `scale(${this.currentZoom})`;
    }

    setToCenter() {
        this.parentElement.scrollTo({
            top: this.parentElement.scrollHeight / 2 - this.parentElement.offsetHeight / 2,
            left: this.parentElement.scrollWidth / 2 - this.parentElement.offsetWidth / 2
        });
    }

    clearFlow() {
        this.nodes = [];
        this.containerElement.innerHTML = '';
        this.nextNodeId = 0;
        this.createCanvasElement();
    }
}

window['FlowJS'] = FlowJS;