import { TableContainer, Table, TableCaption, Thead, Tr, Th, Tbody, Td, Tfoot } from '@chakra-ui/react'
import React from 'react'

const tasks = {
    "anterior": [
        null,
        null,
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
    return (
        <TableContainer>
            <Table variant='simple'>
                <Thead>
                    <Tr>
                        <Th>Immediately anterior tasks</Th>
                        <Th>Tasks to be done</Th>
                        <Th>Immediately subsequent tasks</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {tasks.current.map((task, index) => (
                        <Tr key={index}>
                            <Td>{tasks.anterior[index] ? tasks.anterior[index]?.join(",") : "-"}</Td>
                            <Td>{task}</Td>
                            <Td></Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
        </TableContainer>
    )
}

export default Pert;

function processTasks(){
    
}