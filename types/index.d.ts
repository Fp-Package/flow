// flowjs.d.ts
import { FlowData } from "../ts/flow.interface.js";
import { FlowNode } from "./node.js";

export default class FlowJS {
    containerElement: HTMLElement;
    nodes: FlowNode[];
    private nextNodeId: number;
    private modalElement: HTMLElement;
    private canvasElement: HTMLCanvasElement;
    private currentZoom: number;
    private elementScale: number;
    private transformLevel: number;
    private initialWidth: number;
    private initialHeight: number;
    private isOneNodeMoving: boolean;
    private lineWidth: number;
    private mouseMoveTimer: any;
    private readonly MOUSE_MOVE_DELAY: number;
    private readonly LINE_COLOR: string;

    constructor(parentElement: HTMLElement, savedFlowData?: FlowData);

    private createContainer(el: HTMLElement): void;
    private createCanvasElement(): void;
    private applyParentStyles(): void;
    private handleScroll(): void;
    private setScrollPosition(): void;
    private createModal(): void;

    /**
     * Add a node to the flow
     * @param el HTMLElement to show inside the node
     * @param name Name of the node
     */
    addNode(el?: HTMLElement, name?: string): FlowNode;

    private setNewNode(nodeId: number, el?: HTMLElement, name?: string): FlowNode;

    /**
     * Remove a node from the flow
     * @param nodeId The id of the node to remove
     */
    removeNode(nodeId: number): void;

    /**
     * Set the flow with saved data
     */
    private setSavedFlow(): void;

    /**
     * Connect two nodes
     * @param fromNode The node to connect from
     */
    private connectNodes(fromNode: FlowNode): void;

    private drawConnection(fromNode: FlowNode, toNode: FlowNode): void;

    private drawConnections(): void;

    private drawLine(fromNode: FlowNode, toNode: FlowNode): void;

    private handleZoom(): void;

    private drawArrow(fromNode: FlowNode, toNode: FlowNode): void;

    private get ctx(): CanvasRenderingContext2D;

    private watchMinMaxScroll(): void;

    get flowInfo(): FlowData;

    setDefaultZoom(): void;
    setToCenter(): void;
    clearFlow(): void;
}
