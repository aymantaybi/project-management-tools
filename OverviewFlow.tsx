import { useEffect, useState } from 'react';
import ReactFlow, { Position } from 'react-flow-renderer';

const edgesLength = { x: 200, y: 50 };

const initialNodes = [
  {
    id: '1',
    data: { label: '1' },
    position: { x: 10, y: 250 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    style: { width: 50, height: 50, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }
  }
];

const initialEdges = [
  { id: 'e1-2', source: '1', target: '2', type: "straight", label: 'A' },
  { id: 'e2-3', source: '2', target: '3', type: "straight" },
];

interface Tasks {
  anterior: string[][],
  current: string[],
  subsequent: string[][],
}

const tasks: Tasks = {
  "anterior": [
    [],
    [],
    ["A"],
    ["A"],
    ["A", "B"],
    ["C"],
    ["E"],
    ["D", "F"],
    ["G"],
    ["H", "I"]
  ],
  "current": ["A", "B", "C", "E", "D", "F", "H", "G", "I", "J"],
  "subsequent": []
}

function Flow() {

  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  useEffect(() => {

    var subsequentTasks = getSubsequentTasks(tasks);

    var beginningTasks = getBeginningTasks(tasks);

    var finishingTasks = getFinishingTasks(tasks);

    var convergentTasks = getConvergentTasks(tasks);

    console.log({ subsequentTasks });

    console.log({ beginningTasks });

    console.log({ finishingTasks });

    console.log({ convergentTasks });

  }, [])

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow nodes={nodes} edges={edges} fitView={true} />
    </div>
  )
}

export default Flow;


function getSubsequentTasks(tasks: Tasks) {

  var subsequentTasks: string[][] = [];

  for (var i = 0; i < tasks.current.length; i++) {

    var currentTask = tasks.current[i];

    tasks.anterior.forEach((anteriorTasks, index) => {

      subsequentTasks[index] = subsequentTasks[index] || [];

      if (
        (anteriorTasks.length == 1 && anteriorTasks[0] == currentTask)
        ||
        (anteriorTasks.length > 1 && anteriorTasks[anteriorTasks.length - 1] == currentTask)
      ) {
        subsequentTasks[i].push(tasks.current[index]);
      }

    });
  }
  return subsequentTasks;
}

function getBeginningTasks(tasks: Tasks) {
  let beginningTasks: string[] = [];
  tasks.current.forEach((currentTask, index) => {
    if (tasks.anterior[index].length) return
    beginningTasks.push(currentTask);
  });
  return beginningTasks;
}

function getFinishingTasks(tasks: Tasks) {
  let finishingTasks: string[] = tasks.current.filter(currentTask => !tasks.anterior.find(anteriorTasks => anteriorTasks.includes(currentTask)));
  return finishingTasks;
}

function getConvergentTasks(tasks: Tasks) {

  let convergentTasks: string[][] = [];

  tasks.anterior.forEach((anteriorTasks) => {

    if (anteriorTasks.length < 2) return;

    var todoTasksIndexes = anteriorTasks.map(anteriorTask => tasks.current.findIndex(currentTask => currentTask == anteriorTask));

    var todoAnteriors = todoTasksIndexes.map(index => tasks.anterior[index]);

    if (todoAnteriors.find(anteriors => anteriors.length == 0)) return;

    convergentTasks.push(anteriorTasks);

  });

  return convergentTasks;
}
