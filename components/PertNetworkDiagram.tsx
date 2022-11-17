import ReactFlow, { Position, Node, Edge, useNodesState, useEdgesState } from "react-flow-renderer";
import { Pert, PrecedenceCondition } from "../lib/pert-network";

const precedenceConditions: PrecedenceCondition[] = [
  { task: "A", anteriors: [] },
  { task: "B", anteriors: [] },
  { task: "C", anteriors: ["A"] },
  { task: "E", anteriors: ["A"] },
  { task: "D", anteriors: ["A", "B"] },
  { task: "F", anteriors: ["C"] },
  { task: "H", anteriors: ["E"] },
  { task: "G", anteriors: ["D", "F"] },
  { task: "I", anteriors: ["G"] },
  { task: "J", anteriors: ["H", "I"] },
];

const nodeStyle = {
  width: 50,
  height: 50,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  borderRadius: "50%",
};

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
      style: nodeStyle,
    }))
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    tasks.map((task) => ({
      ...task,
      type: "straight",
      label: task.id,
    }))
  );

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
      />
    </div>
  );
}
