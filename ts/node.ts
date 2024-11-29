import { ConnectionIcon, DeleteIcon, EditIcon } from "./icons.js";

export class FlowNode {
    nodeId: number = 0;
    nodeName: string;
    nodeElement: HTMLElement;
    onRemove: Function;
    onConnection: Function;
    connections: { nodeId: number; type: 'out' | 'in' }[] = [];
    drawConnections: Function;
    parentScrollPosition: Function;
    zoomPosition: Function;
    containerElement: HTMLElement;
    onNodeMove: Function;
    metaData: any = {};

    constructor(private id: number, private innerElement?: HTMLElement, private name?: string) {
        this.nodeId = this.id;
        this.nodeName = this.name || ('Node ' + this.nodeId);
        this.createNode();
    }

    private createNode(): void {
        const node = document.createElement('div');
        node.classList.add('fp-flowjs-node', 'fp-flowjs-node-' + this.nodeId);
        const title = document.createElement('div');

        // Create title element
        title.classList.add('fp-flowjs-node-title');
        title.innerText = this.nodeName;

        // Create node controllers
        const controllers = document.createElement('div');
        controllers.classList.add('fp-flowjs-node-controllers');
        const deleteIcon = DeleteIcon();
        const editIcon = EditIcon();
        const connectionIcon = ConnectionIcon();
        controllers.appendChild(editIcon);
        controllers.appendChild(connectionIcon);
        controllers.appendChild(deleteIcon);

        connectionIcon.addEventListener('click', () => { this.onConnection(this) });
        deleteIcon.addEventListener('click', () => { this.onRemove(this.nodeId) });

        // Create node header
        const header = document.createElement('div');
        header.classList.add('fp-flowjs-node-header');
        header.appendChild(title);
        header.appendChild(controllers);

        // Append header to node
        node.appendChild(header);

        // Create body element
        const body = document.createElement('div');
        body.classList.add('fp-flowjs-node-body');
        if (this.innerElement) {
            body.appendChild(this.innerElement);
        }
        node.appendChild(body);
        this.nodeElement = node;

        this.watchMove();
    }

    private watchMove() {
        let isDragging = false;
        let clientX = 0;
        let clientY = 0;
        let left = 0;
        let top = 0;

        this.nodeElement.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            this.onNodeMove(true);
            this.nodeElement.style.userSelect = 'none';
            isDragging = true;
            clientX = e.clientX;
            clientY = e.clientY;
            left = this.nodeElement.offsetLeft;
            top = this.nodeElement.offsetTop;
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                let animationFrameId = null;
                if (!animationFrameId) {
                    animationFrameId = requestAnimationFrame(() => {
                        this.nodeElement.style.left = left + e.clientX - clientX + 'px';
                        this.nodeElement.style.top = top + e.clientY - clientY + 'px';
                        this.drawConnections();
        
                        animationFrameId = null;
                    });
                }
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (isDragging) {
                isDragging = false;
                this.onNodeMove(false);
                this.nodeElement.style.userSelect = 'auto';
            }
        });
    }

    get centerX() {
        return this.nodeElement.offsetLeft + (this.nodeElement.offsetWidth / 2);
    }

    get centerY() {
        return this.nodeElement.offsetTop + (this.nodeElement.offsetHeight / 2);
    }

    set element(element: HTMLElement) {
        this.innerElement = element;
        this.nodeElement.querySelector('.fp-flowjs-node-body').appendChild(element);
    }
}