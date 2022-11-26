import ReactFlow, { Handle, Position, Node, Edge, useNodesState, useEdgesState, NodeProps, Controls } from "react-flow-renderer";
import { Pert, Network } from "../lib/pert-network";
import { useEffect, useMemo } from "react";

function CustomNode(node: NodeProps<any>) {
  return (
    <div>
      <Handle type="target" position={Position.Left} />
      <div
        style={{
          width: 50,
          height: 50,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: "50%",
          border: "1px solid black",
        }}
      >
        <div style={{ position: "absolute", bottom: 50, color: "green" }}>{node.data.startingDateASAP}</div>
        {node.data.label}
        <div style={{ position: "absolute", top: 50, color: "red" }}>0</div>
      </div>
      <Handle type="source" position={Position.Right} id="a" />
    </div>
  );
}

interface PertNetworkDiagramProps {
  network: Network;
}

export default function PertNetworkDiagram(props: PertNetworkDiagramProps) {
  const { network } = props;
  const { tasks, steps } = network;

  useEffect(() => {
    setNodes(
      steps.map((step) => ({
        id: step.id,
        data: { label: step.id, ...step },
        position: { x: 10 + Number(step.id) * 100, y: 250 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        type: "custom",
      }))
    );

    setEdges(
      tasks.map((task) => ({
        ...task,
        type: "straight",
        label: `${task.id} (${task.duration})`,
        animated: Boolean(task.fictional),
      }))
    );
  }, [network]);

  const [nodes, setNodes, onNodesChange] = useNodesState(
    steps.map((step) => ({
      id: step.id,
      data: { label: step.id, ...step },
      position: { x: 10 + Number(step.id) * 100, y: 250 },
      targetPosition: Position.Left,
      sourcePosition: Position.Right,
      type: "custom",
    }))
  );

  const [edges, setEdges, onEdgesChange] = useEdgesState(
    tasks.map((task) => ({
      ...task,
      type: "straight",
      label: `${task.id} (${task.duration})`,
      animated: Boolean(task.fictional),
    }))
  );

  console.log({ steps });

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div
      style={{
        height: "500px",
        width: "90%",
        borderRadius: "10px",
        borderWidth: "1px",
        borderColor: "black",
        padding: "2rem",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodeTypes={nodeTypes}
        attributionPosition="bottom-right"
      >
        <Controls />
      </ReactFlow>
    </div>
  );
}
