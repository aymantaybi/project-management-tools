import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot } from "@chakra-ui/react";
import React from "react";

interface PrecedenceCondition {
  task: string;
  anteriors: string[];
}

interface TaskSubsequents {
  task: string;
  subsequents: string[];
}

interface Task extends PrecedenceCondition, TaskSubsequents {}

interface TaskWithStep extends Task {
  step: number | null;
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

function getStartingTasks(precedenceConditions: PrecedenceCondition[]) {
  return precedenceConditions.filter((condition) => condition.anteriors.length == 0).map((condition) => condition.task);
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
  levels.push({ tasks: getStartingTasks(precedenceConditions), level: lastLevelNumber });
  for (const task of tasks) {
    if (task.subsequents.length) {
      lastLevelNumber = lastLevelNumber + 1;
      levels.push({ tasks: task.subsequents, level: lastLevelNumber });
    }
  }
  return levels;
}

function Pert() {
  const tasks: Task[] = getTasksSubsequents(precedenceConditions).map((taskSubsequents, index) => ({
    ...taskSubsequents,
    ...precedenceConditions[index],
  }));

  console.log(tasks);

  console.log(getTasksLevel(tasks));

  return (
    <TableContainer width="90%" borderRadius="xl" borderWidth="1px" borderColor="gray.500" padding="1rem">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Immediately anterior tasks</Th>
            <Th>Tasks to be done</Th>
            <Th>Immediately subsequent tasks</Th>
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

export default Pert;
