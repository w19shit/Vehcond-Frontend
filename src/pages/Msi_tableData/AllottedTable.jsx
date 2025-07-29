import React, { useEffect, useState, useMemo } from 'react';
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
  Select,
  useDisclosure,
} from '@chakra-ui/react';

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

import { useDebounce } from "use-debounce";

import { useFetchAllottedVehicles } from '../../hooks/transportActions'; 
import { useFetchAllottedVehicleDates } from '../../hooks/dateQueries';

import SearchInput from "../../components/core/SearchInput";
import VehicleDetailsViewModal from '../../components/common/VehicleDetailsViewModal';
import AllotmentLetterPDFModal from '../../components/common/AllotmentLetterPDFModal';

const AllottedTable = ({filterValues, setSearch, setYear, setMonth, }) => {
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);

    const [debouncedSearch] = useDebounce(filterValues.search, 500);
    
    const { isOpen : isDetailsOpen, onOpen : onDetailsOpen, onClose : onDetailsClose } = useDisclosure();
    const [ selectedApplicationCode, setSelectedApplicationCode] = useState(null);

    const { isOpen: isPdfOpen, onOpen: onPdfOpen, onClose: onPdfClose } = useDisclosure();
    const [ selectedRowForPrint, setSelectedRowForPrint] = useState(null);



    const 
    {
        data: allottedDatesResponse,
        isLoading: isLoadingDates,
    } = useFetchAllottedVehicleDates();

    const availableDates = allottedDatesResponse?.data ?? [];

    const availableYears = useMemo(() => {
        return availableDates.map(dateInfo => dateInfo.year);
    }, [availableDates]);

    const availableMonthsForSelectedYear = useMemo(() => {
        if(!filterValues.year || availableDates.length === 0)
        {
            return [];
        }

        const yearData = availableDates.find(d => d.year == filterValues.year);

        return yearData ? yearData.months : [];
    }, [filterValues.year, availableDates]);

    const monthLabels = {
        1: 'January', 2: 'February', 3: 'March', 4: 'April', 5: 'May', 6: 'June',
        7: 'July', 8: 'August', 9: 'September', 10: 'October', 11: 'November', 12: 'December'
    };

    const {
        data: response,
        isLoading,
        isError,
        error,
        isFetching,
        isPreviousData
    } = useFetchAllottedVehicles(pageNumber, pageSize, debouncedSearch, filterValues.year, filterValues.month);

    const fetchedData = response?.data?.content ?? [];
    const totalPages = response?.data?.totalPages ?? 0;
    const totalElements = response?.data?.totalElements ?? 0;
    const currentPageNumber = response?.data?.number ?? 0;
    const currentPageSize = response?.data?.size ?? pageSize;

    const startIndex = currentPageNumber * currentPageSize;
    const endIndex = startIndex + fetchedData.length;

    useEffect(() => {
        setPageNumber(0);
    }, [debouncedSearch, filterValues.year, filterValues.month]);

    const handleViewClick = (applicationCode) => {
        setSelectedApplicationCode(applicationCode);
        onDetailsOpen();
    }

    const handleCloseModal = () => {
        onDetailsClose();
        setSelectedApplicationCode(null);
    }

    const handlePrintClick = (row) => {
        setSelectedRowForPrint({
            appNo: row.applicationCode,
            // letterNo: row.letterNo,
        });
        onPdfOpen();
    };

    const handleClosePdfModal = () => {
        onPdfClose();
        setSelectedRowForPrint(null);
    }

    
    const containerBg = useColorModeValue('white', 'gray.800');
    const textColor = useColorModeValue('gray.600', 'gray.400');
    
    // --- Render Logic ---
    return (
        <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="md" bg={containerBg} shadow="sm">
            <Heading size="md" mb={4} color={textColor}>Allotted</Heading>

        
            {isLoading && (
                <Flex justify="center" align="center" height="200px">
                    <Spinner /> <Text ml={3}>Loading...</Text>
                </Flex>
            )}

            {isError && (
                <Alert status="error" borderRadius="md" mb={4}>
                    <AlertIcon />
                    <Box>
                        <Text fontWeight="bold">Error Fetching Data</Text>
                        <Text>{error instanceof Error ? error.message : 'An unknown error occurred.'}</Text>
                    </Box>
                </Alert>
            )}

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
                                    setPageNumber(0);
                                }}
                            />
                        </VStack>
                        
                        {/* Right Side - Search Field */}
                        <HStack spacing={2} width={{ base: '100%', md: 'auto' }}>
                            <Select
                                placeholder="All Years"
                                size="sm"
                                maxW="120px"
                                value={filterValues.year}
                                onChange={(e) => setYear(e.target.value)}
                                isDisabled={isLoadingDates || availableYears.length === 0}
                            >
                                {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
                            </Select>
                            <Select
                                placeholder="All Months"
                                size="sm"
                                maxW="130px"
                                value={filterValues.month}
                                onChange={(e) => setMonth(e.target.value)}
                                isDisabled={!filterValues.year || availableMonthsForSelectedYear.length === 0}
                            >
                                {availableMonthsForSelectedYear.map(monthValue => <option key={monthValue} value={monthValue}>{monthLabels[monthValue]}</option>)}
                            </Select>
                            <SearchInput
                                searchText={filterValues.search}
                                setSearchText={setSearch} // Pass the setter function directly
                                size="sm"
                                maxW={{ base: 'full', sm: '200px' }}
                                flexGrow={1}
                            />
                        </HStack>
                    </Flex>

                    <DataTableContainer>
                        <DataTable>
                            <DThead>
                                <DTr>
                                    <DTh>Registration Number</DTh>
                                    <DTh>Department Name</DTh>
                                    <DTh>Vehicle Description</DTh>
                                    <DTh>Purchase Date</DTh>
                                    <DTh>Allottees Name</DTh>
                                    <DTh>Allottees Address</DTh>
                                    <DTh>Allotted Date</DTh>
                                    <DTh>Allotment Letter</DTh>
                                    <DTh>Actions</DTh>
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
                                    fetchedData.map((row) => (
                                        <DTr key={row.applicationCode}>
                                            <DTd><Text fontWeight="medium" color="teal.600">{row?.registrationNo || 'N/A'}</Text></DTd>
                                            <DTd>
                                                {row.departmentName || 'N/A'}
                                            </DTd>
                                            <DTd>{row.vehicleDescription || 'N/A'}</DTd>
                                            <DTd>{row.purchaseDate}</DTd>
                                            <DTd>
                                                {row.allotteesname}
                                            </DTd>
                                            <DTd>
                                                {row.allotteesaddress}
                                            </DTd>
                                            <DTd>
                                                {row.allotteddate}
                                            </DTd>
                                            <DTd>
                                                <HStack spacing={2}>
                                                    <Button 
                                                        size="sm" 
                                                        colorScheme="teal" 
                                                        variant="outline"
                                                        onClick={() => handlePrintClick(row)}
                                                        // isDisabled={!row.letterNo}
                                                    >
                                                        Print
                                                    </Button>
                                                </HStack>
                                            </DTd>

                                            <DTd>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    colorScheme="teal"
                                                    aria-label="View Details"
                                                    onClick={() => handleViewClick(row.applicationCode)}
                                                >View Vehicle Details</Button>
                                            </DTd>
                                        </DTr>
                                    ))
                                ) : null}
                                {/* Show no data message */}
                                {!isFetching && fetchedData.length === 0 && (
                                    <DTr>
                                        <DTd colSpan={8} textAlign="center" color={textColor} py={6}>
                                            {debouncedSearch ? 'No vehicles match your search.' : 'No vehicles pending action found.'}
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
                                    isDisabled={isFetching || isPreviousData} 
                                />
                            </>
                        ) : (
                            !isFetching && <Text fontSize="sm" color={textColor}>No entries found</Text>
                        )}
                    </Flex>
                </>
            )}

            <VehicleDetailsViewModal
                isOpen={isDetailsOpen}
                onClose={handleCloseModal}
                applicationCode={selectedApplicationCode}
            />

            <AllotmentLetterPDFModal isOpen={isPdfOpen} 
            onClose={handleClosePdfModal} rowState={selectedRowForPrint} />
        </Box>
    );
};

export default AllottedTable;