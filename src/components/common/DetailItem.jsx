import { Box, Text, useColorModeValue } from '@chakra-ui/react';

const DetailItem = ({ label, value, isTextArea = false }) => {
  const labelColor = useColorModeValue('gray.600', 'gray.400');
  const formattedValue = value || '—'; 

  return (
    <Box py={2}>
      <Text fontSize="sm" fontWeight="bold" color={labelColor}>
        {label}
      </Text>
      <Text
        fontSize="md"
        whiteSpace={isTextArea ? 'pre-wrap' : 'normal'}
      >
        {formattedValue}
      </Text>
    </Box>
  );
};

export default DetailItem;