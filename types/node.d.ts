// flow-node.d.ts
export interface Connection {
    nodeId: number;
    type: 'out' | 'in';
}

export class FlowNode {
    nodeId: number;
    nodeName: string;
    nodeElement: HTMLElement;
    onRemove: (nodeId: number) => void;
    onConnection: (node: FlowNode) => void;
    connections: Connection[];
    drawConnections: () => void;
    parentScrollPosition: () => { x: number; y: number };
    zoomPosition: () => { x: number; y: number };
    containerElement: HTMLElement;
    onNodeMove: (isDragging: boolean) => void;
    metaData: Record<string, any>;

    constructor(id: number, innerElement?: HTMLElement, name?: string);

    private createNode(): void;
    private watchMove(): void;

    get centerX(): number;
    get centerY(): number;

    set element(element: HTMLElement);
}
