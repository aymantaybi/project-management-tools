import ReactFlow, { Position, Node, Edge, useNodesState, useEdgesState } from "react-flow-renderer";

interface PrecedenceCondition {
  task: string;
  anteriors: string[];
}

interface TaskSubsequents {
  task: string;
  subsequents: string[];
}

interface Task extends PrecedenceCondition, TaskSubsequents {}

interface ConvergentesTasks {
  tasks: string[];
  end: string;
}

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

function getBeginningTasks(precedenceConditions: PrecedenceCondition[]) {
  return precedenceConditions.filter((condition) => condition.anteriors.length == 0).map((condition) => condition.task);
}

function getCompletingTasks(precedenceConditions: PrecedenceCondition[]) {
  const tasks: string[] = [];
  const anteriors: string[] = [];
  for (const precedenceCondition of precedenceConditions) {
    tasks.push(precedenceCondition.task);
    anteriors.push(...precedenceCondition.anteriors);
  }
  return tasks.filter((task) => !anteriors.includes(task));
}

function getConvergentTasks(tasks: Task[]) {
  const convergentTasks: ConvergentesTasks[] = [];
  for (const task of tasks) {
    if (task.subsequents.length == 0) {
      const currentTaskWithNoSubsequents = task.task;
      const taskWithCurrentTaskAsAnterior = tasks.find(
        (task) => task.anteriors.length >= 2 && task.anteriors.includes(currentTaskWithNoSubsequents)
      );
      if (taskWithCurrentTaskAsAnterior) {
        const { anteriors } = taskWithCurrentTaskAsAnterior;
        for (const anterior of anteriors) {
          if (anterior == currentTaskWithNoSubsequents) continue;
          convergentTasks.push({
            tasks: [currentTaskWithNoSubsequents, anterior],
            end: taskWithCurrentTaskAsAnterior.task,
          });
        }
      }
    }
  }
  return convergentTasks;
}

function getTasksSubsequents(precedenceConditions: PrecedenceCondition[]): TaskSubsequents[] {
  const tasks = precedenceConditions.map((precedenceCondition) => precedenceCondition.task);
  const tasksSubsequents: { [task: string]: string[] } = {};
  for (const task of tasks) {
    tasksSubsequents[task] = [];
    for (const precedenceCondition of precedenceConditions) {
      const anteriorsLength = precedenceCondition.anteriors.length;
      if (precedenceCondition.anteriors[anteriorsLength - 1] == task) {
        tasksSubsequents[task].push(precedenceCondition.task);
      }
    }
  }

  console.log(tasksSubsequents);

  return Object.entries(tasksSubsequents).map(([key, value]) => ({ task: key, subsequents: value }));
}

function getTasksLevel(tasks: Task[]) {
  let lastLevelNumber = 0;
  const levels: Array<{ tasks: string[]; level: number }> = [];
  levels.push({ tasks: getBeginningTasks(precedenceConditions), level: lastLevelNumber });
  for (const task of tasks) {
    if (task.subsequents.length) {
      lastLevelNumber = lastLevelNumber + 1;
      levels.push({ tasks: task.subsequents, level: lastLevelNumber });
    }
  }
  return levels;
}

function getTasksStep(task: string, levels: Array<{ tasks: string[]; level: number }>) {
  const taskLevel = levels.find((level) => level.tasks.includes(task));
  return taskLevel ? taskLevel.level + 1 : null;
}

const tasks: Task[] = getTasksSubsequents(precedenceConditions).map((taskSubsequents, index) => ({
  ...taskSubsequents,
  ...precedenceConditions[index],
}));

function getTaskSubsequents(task: string, tasks: Task[]) {
  const currentTask = tasks.find((item) => item.task == task);
  return currentTask?.subsequents ?? [];
}

class Network {
  nodeStyle = {
    width: 50,
    height: 50,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
  };
  nodes: Node[];
  edges: Edge[] = [];

  defaultEdgesLength = { x: 180, y: 120 };

  constructor() {
    this.nodes = [
      {
        id: "1",
        data: { label: "1" },
        position: { x: 10, y: 250 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: this.nodeStyle,
      },
    ];
  }

  addNode(node: Node) {
    this.nodes.push(node);
  }

  addEdge(edge: Edge) {
    this.edges.push(edge);
  }
}

function taskConvergence(task: string, convergentTasks: ConvergentesTasks[]) {
  return convergentTasks.find((item) => item.tasks.includes(task));
}

export default function PertNetworkDiagram() {
  const beginningTasks = getBeginningTasks(precedenceConditions);
  const completingTasks = getCompletingTasks(precedenceConditions);
  const convergentTasks = getConvergentTasks(tasks);
  const levels = getTasksLevel(tasks);

  const network = new Network();

  for (const level of levels.concat({ level: levels[levels.length - 1].level + 1, tasks: [] })) {
    if (level.level > 0) {
      const { nodes } = network;
      const lastNode = nodes[nodes.length - 1];
      network.addNode({
        id: String(level.level + 1),
        data: { label: String(level.level + 1) },
        position: { x: lastNode.position.x + 100, y: 250 },
        targetPosition: Position.Left,
        sourcePosition: Position.Right,
        style: network.nodeStyle,
      });
    }
  }

  for (const currentTask of tasks.map((task) => task.task)) {
    const currentTaskStep = getTasksStep(currentTask, levels);
    const taskSubsequents = getTaskSubsequents(currentTask, tasks);
    if (taskSubsequents.length) {
      for (const taskSubsequent of taskSubsequents) {
        const taskSubsequentStep = getTasksStep(taskSubsequent, levels);
        network.addEdge({
          id: `${currentTask}-${taskSubsequentStep}`,
          source: String(currentTaskStep),
          target: String(taskSubsequentStep),
          type: "straight",
          label: currentTask,
        });
      }
    } else {
      const currentTaskConvergence = taskConvergence(currentTask, convergentTasks);
      if (currentTaskConvergence) {
        const currentTaskConvergenceEndStep = getTasksStep(currentTaskConvergence.end, levels);
        network.addEdge({
          id: `${currentTask}-${currentTaskConvergenceEndStep}`,
          source: String(currentTaskStep),
          target: String(currentTaskConvergenceEndStep),
          type: "straight",
          label: currentTask,
        });
      } else if (completingTasks.includes(currentTask)) {
        const finalStep = currentTaskStep ? currentTaskStep + 1 : null;
        network.addEdge({
          id: `${currentTask}-${finalStep}`,
          source: String(currentTaskStep),
          target: String(finalStep),
          type: "straight",
          label: currentTask,
        });
      }
    }
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(network.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(network.edges);

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
