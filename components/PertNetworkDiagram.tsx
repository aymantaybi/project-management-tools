import ReactFlow, { Handle, Position, Node, Edge, useNodesState, useEdgesState, NodeProps } from "react-flow-renderer";
import { Pert, PrecedenceCondition } from "../lib/pert-network";
import { useCallback, useMemo } from "react";

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
        {node.data.label}
      </div>
      <Handle type="source" position={Position.Right} id="a" />
    </div>
  );
}

const precedenceConditions: PrecedenceCondition[] = [
  { task: "A", anteriors: [], duration: 4 },
  { task: "B", anteriors: [], duration: 2 },
  { task: "C", anteriors: ["A"], duration: 1 },
  { task: "E", anteriors: ["A"], duration: 2 },
  { task: "D", anteriors: ["A", "B"], duration: 1 },
  { task: "F", anteriors: ["C"], duration: 2 },
  { task: "H", anteriors: ["E"], duration: 10 },
  { task: "G", anteriors: ["D", "F"], duration: 2 },
  { task: "I", anteriors: ["G"], duration: 4 },
  { task: "J", anteriors: ["H", "I"], duration: 1 },
];

export default function PertNetworkDiagram() {
  const pert = new Pert(precedenceConditions);

  console.log(pert.tasks());
  console.log(pert.network());

  const { tasks, steps } = pert.network();

  const [nodes, setNodes, onNodesChange] = useNodesState(
    steps.map((step) => ({
      ...step,
      data: { label: step.id },
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
    }))
  );

  const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

  return (
    <div
      style={{
        height: "500px",
        width: "90%",
        borderRadius: "10px",
        borderWidth: "1px",
        borderColor: "black",
        padding: "1rem",
      }}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView={true}
        nodeTypes={nodeTypes}
      />
    </div>
  );
}
