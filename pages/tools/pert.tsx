import { AddIcon, CheckIcon, CloseIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  IconButton,
  Stack,
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import EditableText from "../../components/EditableText";
import PertNetworkDiagram from "../../components/PertNetworkDiagram";
import { Pert, PrecedenceCondition, Task, TasksLevel, ConvergingTasks, Network } from "../../lib/pert-network";

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

interface PertTableProps {
  precedenceConditionsArray: PrecedenceCondition[];
  setPrecedenceConditionsArray: React.Dispatch<React.SetStateAction<PrecedenceCondition[]>>;
  pert: Pert;
}

interface TasksDetailsProps {
  pert: Pert;
  beginningTasks: string[];
  completingTasks: string[];
  convergingTasks: ConvergingTasks[];
  tasksLevels: TasksLevel[];
}

interface TasksLevelTableProps {
  pert: Pert;
  beginningTasks: string[];
  completingTasks: string[];
  convergingTasks: ConvergingTasks[];
  tasksLevels: TasksLevel[];
}

function PertTable(props: PertTableProps) {
  const { pert, precedenceConditionsArray, setPrecedenceConditionsArray } = props;

  const tasks = pert.tasks();

  const makeTaskAnteriorsChangeHandler = (task: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const anteriorsStringValue = event.target.value;
      const anteriors = anteriorsStringValue.split(",").filter((item: string) => item);
      setPrecedenceConditionsArray((current) => {
        const taskPrecedenceConditionsIndex = current.findIndex((item) => item.task == task);
        current[taskPrecedenceConditionsIndex] = { ...current[taskPrecedenceConditionsIndex], anteriors };
        console.log(current);
        return [...current];
      });
    };
  };

  const makeTaskChangeHandler = (task: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTask = event.target.value;
      setPrecedenceConditionsArray((current) => {
        const taskPrecedenceConditionsIndex = current.findIndex((item) => item.task == task);
        current[taskPrecedenceConditionsIndex] = { ...current[taskPrecedenceConditionsIndex], task: newTask };
        return [...current];
      });
    };
  };

  const makeTaskDurationChangeHandler = (task: string) => {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const newDuration = isNaN(event.target.value as any) ? 0 : Number(event.target.value);
      setPrecedenceConditionsArray((current) => {
        const taskPrecedenceConditionsIndex = current.findIndex((item) => item.task == task);
        current[taskPrecedenceConditionsIndex] = { ...current[taskPrecedenceConditionsIndex], duration: newDuration };
        return [...current];
      });
    };
  };

  const makeTaskDeleteHandler = (task: string) => {
    return () => {
      setPrecedenceConditionsArray((current) => {
        return [...current.filter((item) => item.task != task)];
      });
    };
  };

  return (
    <TableContainer borderRadius="xl" borderWidth="1px" borderColor="gray.500" padding="1rem">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Antérieure(s)</Th>
            <Th>Tâche</Th>
            <Th>Postérieure(s)</Th>
            <Th>Durée</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tasks.map((task, index) => (
            <Tr key={index}>
              <Td>
                <EditableText
                  value={task.anteriors.length > 0 ? task.anteriors.join(", ") : "-"}
                  onChange={makeTaskAnteriorsChangeHandler(task.task)}
                />
              </Td>
              <Td>
                <EditableText value={task.task} onChange={makeTaskChangeHandler(task.task)} />
              </Td>
              <Td>{task.subsequents.length > 0 ? task.subsequents.join(", ") : "-"}</Td>
              <Td>
                <EditableText value={String(task.duration)} onChange={makeTaskDurationChangeHandler(task.task)} />
              </Td>
              <Td>
                <IconButton icon={<DeleteIcon />} aria-label="" size="xs" onClick={makeTaskDeleteHandler(task.task)} />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <AddtTaskPrecedenceConditionsButton setPrecedenceConditionsArray={setPrecedenceConditionsArray} />
    </TableContainer>
  );
}

function TasksDetails(props: TasksDetailsProps) {
  const { pert, beginningTasks, completingTasks, convergingTasks, tasksLevels } = props;

  return (
    <VStack spacing={4} width={"100%"} display="flex" justifyContent="center">
      <Text fontSize="sm">- Tâches Commençantes : {beginningTasks.join(", ")}</Text>
      <Text fontSize="sm">- Tâches Finissantes : {completingTasks.join(", ")}</Text>
      <Text fontSize="sm">- Tâches Convergentes :</Text>
      {convergingTasks
        .map((tasks) => `${tasks.tasks.join(", ")} (Étape ${pert.taskStep(tasks.end, tasksLevels)})`)
        .map((item, index) => (
          <Text fontSize="sm" key={index}>
            * {item}
          </Text>
        ))}
    </VStack>
  );
}

function TasksLevelTable(props: TasksLevelTableProps) {
  const { pert, beginningTasks, completingTasks, convergingTasks, tasksLevels } = props;

  return (
    <VStack spacing={4}>
      <TasksDetails {...{ pert, beginningTasks, completingTasks, convergingTasks, tasksLevels }} />
      <TableContainer borderRadius="xl" borderWidth="1px" borderColor="gray.500" padding="1rem">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Niveaux</Th>
              <Th>Taches</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tasksLevels.map((level) => (
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

interface PertOutput {
  beginningTasks: string[];
  completingTasks: string[];
  convergingTasks: ConvergingTasks[];
  tasksLevels: TasksLevel[];
  network: Network;
  tasks: Task[];
}

function PertTool() {
  const [precedenceConditionsArray, setPrecedenceConditionsArray] = useState(precedenceConditions);
  const [outputError, setOutputError] = useState<any>(undefined);

  const pert = new Pert(precedenceConditionsArray);

  const [pertOutput, setPertOutput] = useState<PertOutput>({
    beginningTasks: [],
    completingTasks: [],
    convergingTasks: [],
    tasksLevels: [],
    network: { tasks: [], steps: [] },
    tasks: [],
  });

  const { beginningTasks, completingTasks, convergingTasks, tasksLevels, network, tasks } = pertOutput;

  useEffect(() => {
    try {
      const pertOutput = pert.process();
      setOutputError(undefined);
      setPertOutput(pertOutput);
    } catch (error) {
      console.log(error);
      setOutputError(error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [precedenceConditionsArray]);

  useEffect(() => {
    console.log({ network: pertOutput.network });
  }, [pertOutput]);

  return (
    <VStack spacing={4} width={"100%"} display="flex" justifyContent="center">
      {outputError && (
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{outputError.message}</AlertDescription>
        </Alert>
      )}
      <Stack spacing={4} width={"100%"} display="flex" justifyContent="center" direction={["column", "row"]}>
        <PertTable
          pert={pert}
          precedenceConditionsArray={precedenceConditionsArray}
          setPrecedenceConditionsArray={setPrecedenceConditionsArray}
        />
        <TasksLevelTable {...{ pert, beginningTasks, completingTasks, convergingTasks, tasksLevels }} />
      </Stack>
      <PertNetworkDiagram network={network} />
    </VStack>
  );
}

interface AddtTaskPrecedenceConditionsButtonProps {
  setPrecedenceConditionsArray: React.Dispatch<React.SetStateAction<PrecedenceCondition[]>>;
}

interface ImpermanentPrecedenceCondition {
  task?: string;
  anteriors?: string[];
  duration?: number;
}

function AddtTaskPrecedenceConditionsButton(props: AddtTaskPrecedenceConditionsButtonProps) {
  const { setPrecedenceConditionsArray } = props;

  const [impermanentPrecedenceCondition, setImpermanentPrecedenceCondition] =
    useState<ImpermanentPrecedenceCondition>();

  const [isAdding, setIsAdding] = useState<boolean>(false);

  const handleConfirmAdding = () => {
    setPrecedenceConditionsArray((current) => {
      return [
        ...current,
        {
          ...impermanentPrecedenceCondition,
          anteriors: impermanentPrecedenceCondition?.anteriors || [],
          duration: impermanentPrecedenceCondition?.duration || 0,
        } as PrecedenceCondition,
      ];
    });
    setIsAdding(false);
  };

  const handleCancelAdding = () => {
    setIsAdding(false);
  };

  const handleAnteriorsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const anteriorsStringValue = event.target.value;
    const anteriors = anteriorsStringValue.split(",").filter((item: string) => item);
    setImpermanentPrecedenceCondition((current) => ({ ...current, anteriors }));
  };

  const handleTaskChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const task = event.target.value;
    setImpermanentPrecedenceCondition((current) => ({ ...current, task }));
  };

  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const duration = isNaN(event.target.value as any) ? 0 : Number(event.target.value);
    setImpermanentPrecedenceCondition((current) => ({ ...current, duration }));
  };

  return isAdding ? (
    <VStack width="100%" padding="1rem">
      <HStack width="100%" justifyContent="space-between">
        <Input
          width={"25%"}
          placeholder="ANTÉRIEURE(S)"
          value={impermanentPrecedenceCondition?.anteriors}
          onChange={handleAnteriorsChange}
        />
        <Input
          width={"25%"}
          placeholder="TÂCHE"
          value={impermanentPrecedenceCondition?.task}
          onChange={handleTaskChange}
        />
        <Input
          width={"25%"}
          placeholder="DURÉE"
          value={impermanentPrecedenceCondition?.duration}
          onChange={handleDurationChange}
        />
      </HStack>
      <HStack width="100%">
        <Button width="100%" onClick={handleConfirmAdding}>
          <CheckIcon />
        </Button>
        <Button width="100%" onClick={handleCancelAdding}>
          <CloseIcon />
        </Button>
      </HStack>
    </VStack>
  ) : (
    <Button
      width="100%"
      onClick={() => {
        setIsAdding(true);
      }}
    >
      <AddIcon />
    </Button>
  );
}

export default PertTool;
