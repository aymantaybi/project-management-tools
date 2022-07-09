import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot } from '@chakra-ui/react'
import React from 'react'

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
        ["A", "B"],
        ["A"],
        ["C"],
        ["D", "F"],
        ["E"],
        ["G"],
        ["H", "I"]
    ],
    "current": ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
    "subsequent": []
}

function Pert() {

    var processedTasks = processTasks(tasks);

    return (
        <TableContainer width="90%" borderRadius="xl" borderWidth='1px' borderColor="gray.500" padding="1rem" >
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Immediately anterior tasks</Th>
                        <Th>Tasks to be done</Th>
                        <Th>Immediately subsequent tasks</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {processedTasks.current.map((task, index) => (
                        <Tr key={index}>
                            <Td>{tasks.anterior[index].length > 0 ? tasks.anterior[index]?.join(",") : "-"}</Td>
                            <Td>{task}</Td>
                            <Td>{tasks.subsequent[index].length > 0 ? tasks.subsequent[index]?.join(",") : "-"}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default Pert;

function processTasks(tasks: Tasks) {

    for (var i = 0; i < tasks.current.length; i++) {
        var currentTask = tasks.current[i];
        var subsequentTasks: string[] = [];
        tasks.anterior.forEach((anteriorTasks, index) => {
            if (
                (anteriorTasks.length == 1 && anteriorTasks[0] == currentTask)
                ||
                (anteriorTasks.length > 1 && anteriorTasks[anteriorTasks.length - 1] == currentTask)
            ) {
                subsequentTasks.push(tasks.current[index]);
            }
        });
        tasks.subsequent[i] = subsequentTasks;
    }
    return tasks;
}