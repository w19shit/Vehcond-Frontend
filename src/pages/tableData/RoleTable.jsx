import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  Tag,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Heading,
} from '@chakra-ui/react';

import { useDebounce } from "use-debounce";

import {
  DataTableContainer,
  DataTable,
  DThead,
  DTr,
  DTh,
  DTbody,
  DTd,
  DTPageSizing,
  DTPagination,
} from '../../components/core/DataTable'; 

import { useFetchAllRoles } from '../../hooks/adminActions'; // Adjust path if needed


//import SearchInput from "../../components/core/SearchInput"


// Props: onOpenModal (function to call when an action button is clicked)
const RoleTable = ({ onOpenModal }) => {
  // --- State specific to this table ---
  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  // --- Data Fetching specific to this table ---
  const {
    data: response,
    isLoading,
    isError,
    error,
    isFetching,
    isPreviousData
  } = useFetchAllRoles(pageNumber, pageSize, debouncedSearchTerm);

  // --- Derived Data specific to this table ---
  const fetchedData = response?.data?.content ?? [];
  const totalPages = response?.data?.totalPages ?? 0;
  const totalElements = response?.data?.totalElements ?? 0;
  const currentPageNumber = response?.data?.number ?? 0;
  const currentPageSize = response?.data?.size ?? pageSize;


  const containerBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  // --- Calculation for display ---
  const startIndex = currentPageNumber * currentPageSize;
  const endIndex = startIndex + fetchedData.length;

  // --- Render Logic ---
  return (
    <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="md" bg={containerBg} shadow="sm">
        <Heading size="md" mb={4} color={textColor}>Roles</Heading>
        {/* Loading state specific to this table */}
        {isLoading && (
             <Flex justify="center" align="center" height="200px">
                <Spinner /> <Text ml={3}>Loading...</Text>
             </Flex>
        )}

        {/* Error state specific to this table */}
        {isError && (
            <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold">Error Fetching Data</Text>
                    <Text>{error instanceof Error ? error.message : 'An unknown error occurred.'}</Text>
                </Box>
            </Alert>
        )}

        {/* Render controls and table only if not in initial loading or error state */}
        {!isLoading && !isError && (
            <>
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ base: 'stretch', md: 'center' }}
                    mb={4}
                    gap={4}
                    flexWrap="wrap"
                >
                    {/* Left Side - Page Sizing */}
                    <VStack alignItems="flex-start" spacing={3}>
                        <DTPageSizing
                            pageSize={pageSize}
                            setPageSize={(value) => {
                                setPageSize(Number(value));
                                setPageNumber(0); // Reset page number on size change
                            }}
                        />
                    </VStack>

                    {/* Right Side - Search Field */}
                    <HStack spacing={2} width={{ base: '100%', md: 'auto' }}>
                        <Text fontSize="sm" whiteSpace="nowrap" color={textColor}>Search:</Text>
                        <Input
                            size="sm"
                            placeholder="Reg No, Description..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPageNumber(0); // Reset page number on search
                            }}
                            maxW={{ base: 'full', sm: '250px' }}
                            flexGrow={1}
                        />
                    {/* <SearchInput 
                        searchText={searchTerm}
                        setSearchText={handleSearchChange}
                        size = "sm"
                        maxW={{base: 'full', sm: '250px'}}
                        flexGrow = {1}
                    /> */}
                    </HStack>
                </Flex>

                <DataTableContainer>
                    <DataTable>
                        <DThead>
                            <DTr>
                                <DTh>#</DTh>
                                <DTh>Role Name</DTh>
                                <DTh>Assign</DTh>
                            </DTr>

                        </DThead>
                        <DTbody>
                            {/* Show fetching overlay */}
                            {isFetching && (
                                <DTr>
                                    <DTd colSpan={8} textAlign="center" py={4} position="relative">
                                        {/* Optional: Add overlay for better UX during refetch */}
                                        <Flex justify="center" align="center" position="absolute" inset={0}>
                                            <Spinner size="md" />
                                        </Flex>
                                    </DTd>
                                </DTr>
                            )}
                            {/* Show table rows (only when not fetching to avoid flashing) */}
                            {!isFetching && fetchedData.length > 0 ? (
                                fetchedData.map((row, index) => (
                                        <DTr key={row.rolecode}>
                                        <DTd><Text fontWeight="medium" color="teal.600">{startIndex + index + 1}</Text></DTd>
                                        <DTd>{row.role || 'N/A'}</DTd>
                                        <DTd>
                                             <HStack spacing={2}>
                <                               Button size="xs" colorScheme="teal" variant="outline" onClick={() => onOpenModal(row, 'pages')}>
                                                     Pages
                                                </Button>
                                            </HStack>
                                        </DTd>
                                    </DTr>
                                ))

                            ) : null}
                            {/* Show no data message */}
                            {!isFetching && fetchedData.length === 0 && (
                                <DTr>
                                    <DTd colSpan={8} textAlign="center" color={textColor} py={6}>
                                        {debouncedSearchTerm ? 'No vehicles match your search.' : 'No vehicles pending action found.'}
                                    </DTd>
                                </DTr>
                            )}
                        </DTbody>
                    </DataTable>
                </DataTableContainer>

                {/* --- Pagination --- */}
                <Flex
                    direction={{ base: 'column', md: 'row' }}
                    justifyContent="space-between"
                    alignItems="center"
                    mt={4}
                    gap={2}
                    flexWrap="wrap"
                >
                    {totalElements > 0 ? (
                        <>
                            <Text fontSize="sm" color={textColor}>
                                Showing {startIndex + 1} to {endIndex} of {totalElements} entries
                            </Text>
                            <DTPagination
                                pageNumber={currentPageNumber}
                                setPageNumber={setPageNumber}
                                totalPages={totalPages}
                                isDisabled={isFetching || isPreviousData} // Disable pagination while fetching or showing old data
                            />
                        </>
                    ) : (
                         !isFetching && <Text fontSize="sm" color={textColor}>No entries found</Text> // Only show if not fetching
                    )}
                </Flex>
             </>
        )}
    </Box>
  );
};

export default RoleTable;