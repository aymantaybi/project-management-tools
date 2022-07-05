import { VStack, Text, Heading } from '@chakra-ui/react';
import React from 'react';

function Card(props: { title: string; description: string; }) {

    const { title, description } = props;

    return (
        <VStack spacing={5} align='stretch' borderRadius="xl" borderWidth='1px' borderColor="gray.900" padding="1rem" >
            <Heading size="md" >{title}</Heading>
            <Text fontSize='md'>{description}</Text>
        </VStack>
    )
}

export default Card