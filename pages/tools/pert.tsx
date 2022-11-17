import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Text, VStack, HStack } from "@chakra-ui/react";
import React from "react";
import PertNetworkDiagram from "../../components/PertNetworkDiagram";

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

function getTaskStep(task: string, levels: Array<{ tasks: string[]; level: number }>) {
  const taskLevel = levels.find((level) => level.tasks.includes(task));
  return taskLevel ? taskLevel.level + 1 : null;
}

const tasks: Task[] = getTasksSubsequents(precedenceConditions).map((taskSubsequents, index) => ({
  ...taskSubsequents,
  ...precedenceConditions[index],
}));

function PertTable() {
  return (
    <TableContainer borderRadius="xl" borderWidth="1px" borderColor="gray.500" padding="1rem">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Tâche(s) immédiatement antérieure(s)</Th>
            <Th>Pour réaliser cette tâche...</Th>
            <Th>Tâche(s) immédiatement postérieure(s)</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task, index) => (
            <Tr key={index}>
              <Td>{task.anteriors.length > 0 ? task.anteriors.join(", ") : "-"}</Td>
              <Td>{task.task}</Td>
              <Td>{task.subsequents.length > 0 ? task.subsequents.join(", ") : "-"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

function TasksLevelTable() {
  const levels = getTasksLevel(tasks);

  return (
    <VStack spacing={4}>
      <TasksDetails />
      <TableContainer borderRadius="xl" borderWidth="1px" borderColor="gray.500" padding="1rem">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Niveaux</Th>
              <Th>Taches</Th>
            </Tr>
          </Thead>
          <Tbody>
            {levels.map((level) => (
              <Tr key={level.level}>
                <Td>{level.level}</Td>
                <Td>{level.tasks}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </VStack>
  );
}

function TasksDetails() {
  const beginningTasks = getBeginningTasks(precedenceConditions);
  const completingTasks = getCompletingTasks(precedenceConditions);
  const convergentTasks = getConvergentTasks(tasks);
  const levels = getTasksLevel(tasks);

  return (
    <VStack spacing={4} width={"100%"} display="flex" justifyContent="center">
      <Text fontSize="sm">Taches Commençantes : {beginningTasks.join(", ")}</Text>
      <Text fontSize="sm">Taches Finissantes : {completingTasks.join(", ")}</Text>
      <Text fontSize="sm">
        Taches Convergentes :
        {convergentTasks
          .map((tasks) => `${tasks.tasks.join(", ")} (en Étape ${getTaskStep(tasks.end, levels)} )`)
          .join(" et ")}
      </Text>
    </VStack>
  );
}

function Pert() {
  return (
    <VStack spacing={4} width={"100%"} display="flex" justifyContent="center">
      <HStack spacing={4} width={"100%"} display="flex" justifyContent="center">
        <PertTable />
        <TasksLevelTable />
      </HStack>
      <PertNetworkDiagram />
    </VStack>
  );
}

export default Pert;
