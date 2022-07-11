import { useEffect, useState } from 'react';
import ReactFlow, { Position, Node, Edge, useNodesState, useEdgesState, } from 'react-flow-renderer';
import TasksPathFinder from './TasksPathFinder';

const edgesLength = { x: 180, y: 120 };

const initialNodes: Node[] = [
  {
    id: '1',
    data: { label: '1' },
    position: { x: 10, y: 250 },
    targetPosition: Position.Left,
    sourcePosition: Position.Right,
    style: { width: 50, height: 50, display: "flex", justifyContent: "center", alignItems: "center", borderRadius: "50%" }
  }
];

const initialEdges: Edge[] = [];

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

  var subsequentTasks = getSubsequentTasks(tasks);

  var beginningTasks = getBeginningTasks(tasks);

  var finishingTasks = getFinishingTasks(tasks);

  var convergentTasks = getConvergentTasks(tasks);

  var tasksLevels = getTasksLevels(tasks);

  var tasksPathFinder = new TasksPathFinder(tasks);

  var additionalNodes: Node[] = [];
  var additionalEdges: Edge[] = [];

  var tasksPaths = [];

  tasksPaths = tasks.current.map(currentTasks => {

    var { paths, longestPath, shortestPath } = tasksPathFinder.findPaths(currentTasks, finishingTasks[0]);

    return {
      task: currentTasks,
      paths,
      longestPath,
      shortestPath
    }

  });

  tasksPaths.sort((a, b) => b.longestPath.length - a.longestPath.length);

  console.log(tasksPaths);

  tasksLevels.forEach((levelTasks, tasksLevelsIndex) => {

    var lastNode: Node = additionalNodes.length > 0 ? additionalNodes[additionalNodes.length - 1] : initialNodes[initialNodes.length - 1];

    levelTasks.forEach((levelTask, levelTasksIndex) => {

      var node: Node = JSON.parse(JSON.stringify(lastNode));

      var step = `${Number(node.id) + levelTasksIndex + 1}`;

      var levelConvergentTasks: string[] = convergentTasks.find(convergents => convergents.includes(levelTask))!;

      var levelConvergentTaskEdge = levelConvergentTasks ? additionalEdges.find(edge => levelConvergentTasks.includes(edge.label as string)) : null;

      if (levelConvergentTasks && levelConvergentTaskEdge) {

        step = levelConvergentTaskEdge.target;

      } else {

        node.id = `${Number(node.id) + levelTasksIndex + 1}`;
        node.data.label = `${Number(node.data.label) + levelTasksIndex + 1}`;

        var { x, y } = node.position;

        node.position = {
          x: x + edgesLength.x,
          y: y,
        };

        additionalNodes.push(node);

      }

      if (tasksLevelsIndex > 0) {

        var anteriors = tasks.anterior[tasks.current.findIndex(currentTask => currentTask == levelTask)];

        var anteriorTask = anteriors[anteriors.length - 1];

        var anteriorTaskEdge: Edge | any = additionalEdges.find(edge => edge.label == anteriorTask);

        var edge = { id: `e${anteriorTaskEdge.target}-${step}`, source: anteriorTaskEdge.target, target: step, type: "straight", label: levelTask };

        additionalEdges.push(edge);

      } else {

        additionalEdges.push({ id: `e1-${step}`, source: '1', target: step, type: "straight", label: levelTask });

      }

    })

  });

  for (var node of additionalNodes) {

    if (additionalNodes.find(additionalNode => additionalNode.position.x == node.position.x && additionalNode.position.y == node.position.y && additionalNode.id != node.id)) {

      node.position.y = node.position.y - 200;

    }

  }

  console.log(additionalNodes);

  const [nodes, setNodes, onNodesChange] = useNodesState([...initialNodes, ...additionalNodes]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([...initialEdges, ...additionalEdges]);

  return (
    <div style={{ height: "100vh", width: "100vw" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView={true} />
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

function getTasksLevels(tasks: Tasks) {

  var tasksLevels: string[][] = [getBeginningTasks(tasks)];

  var subsequentTasks = getSubsequentTasks(tasks);

  for (var subsequents of subsequentTasks) {
    if (subsequents.length > 0) {
      tasksLevels.push(subsequents);
    }
  }

  return tasksLevels;

  /* var tasksLevels: Set<string> = new Set();

  for (var anteriorTasks of tasks.anterior) {

    var levelTasks = tasks.current.filter((currentTask, index) => tasks.anterior[index].sort().join("") == anteriorTasks.sort().join(""));

    tasksLevels.add(levelTasks.sort().join(","));

  }

  return Array.from(tasksLevels).map(item => item.split(",")); */
}

function getTasksPath(tasks: Tasks, fromTask: string, toTask: string): any {

  var path: string[][] = [];

  var fromTaskIndex = tasks.current.findIndex(currentTask => currentTask == fromTask);

  var subsequentTasks = getSubsequentTasks(tasks);

  var fromTaskSubsequentTasks = subsequentTasks[fromTaskIndex];

  path.push(fromTaskSubsequentTasks);

  if (fromTaskSubsequentTasks.includes(toTask)) {
    return path;
  } else {
    return fromTaskSubsequentTasks.map(fromTaskSubsequentTask => [...path, getTasksPath(tasks, fromTaskSubsequentTask, toTask)])
  }

}