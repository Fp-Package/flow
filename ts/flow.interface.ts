export interface FlowNodeData {
    connections: { nodeId: number; type: 'out' | 'in' }[];
    metaData: any;
    nodeName: string;
    nodeId: number;
    centerPercentage: { x: number; y: number };
}

export interface FlowData {
    nodes: FlowNodeData[];
    nextNodeId: number;
}