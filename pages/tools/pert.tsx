import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Text, VStack, HStack } from "@chakra-ui/react";
import React from "react";
import PertNetworkDiagram from "../../components/PertNetworkDiagram";
import { Pert, PrecedenceCondition } from "../../lib/pert-network";

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

const pert = new Pert(precedenceConditions);

const tasks = pert.tasks();

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
  const levels = pert.tasksLevels(tasks);

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
  const beginningTasks = pert.beginningTasks();
  const completingTasks = pert.completingTasks();
  const convergentTasks = pert.convergingTasks(tasks);
  const levels = pert.tasksLevels(tasks);

  return (
    <VStack spacing={4} width={"100%"} display="flex" justifyContent="center">
      <Text fontSize="sm">- Tâches Commençantes : {beginningTasks.join(", ")}</Text>
      <Text fontSize="sm">- Tâches Finissantes : {completingTasks.join(", ")}</Text>
      <Text fontSize="sm">- Tâches Convergentes :</Text>
      {convergentTasks
        .map((tasks) => `${tasks.tasks.join(", ")} (Étape ${pert.taskStep(tasks.end, levels)})`)
        .map((item, index) => (
          <Text fontSize="sm" key={index}>
            * {item}
          </Text>
        ))}
    </VStack>
  );
}

function PertTool() {
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

export default PertTool;
