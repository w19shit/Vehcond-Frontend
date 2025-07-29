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
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useDisclosure
} from '@chakra-ui/react';

import { 
  MdArrowForward, 
  MdArrowDownward 
} from "react-icons/md";

import { useDebounce } from 'use-debounce';

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

import { useFetchListFinals } from '../../hooks/dataEntryQueries';

import { downloadFileFromResponse } from '../../components/utils/blobHelper';

import { useGenerateVehicleReport } from '../../hooks/reportQueries';

import VehicleDetailsViewModal from '../../components/common/VehicleDetailsViewModal';

import SearchInput from '../../components/core/SearchInput';

const FinalListDisplay = () => {

  const [pageSize, setPageSize] = useState(10);
  const [pageNumber, setPageNumber] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const [printingCode, setPrintingCode] = useState(null);

  const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

   const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppCode, setSelectedAppCode] = useState(null);

  const { data: response, 
          isLoading, 
          isError,
          error,
         isFetching,
         isPreviousData } = useFetchListFinals( pageNumber, pageSize, debouncedSearchTerm);

  const toast = useToast();

  const { mutateAsync: generateReport } = useGenerateVehicleReport();

  const handleViewDetails = (appCode) => {
    setSelectedAppCode(appCode);
    onOpen();
  };

  const handleCloseModal = () => {
    onClose();
    setSelectedAppCode(null); // Important cleanup
  };

  const handleGenerateReport = async (applicationCode, disposition) => {
    setPrintingCode(applicationCode);
    try {
      // Pass the object to the mutation function
      const response = await generateReport({ applicationCode, disposition });

      if (disposition === 'inline') {
        // --- Logic for VIEWING ---
        const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
        const previewUrl = window.URL.createObjectURL(pdfBlob);
        window.open(previewUrl, '_blank');
        // Revoke the URL after a short delay
        setTimeout(() => window.URL.revokeObjectURL(previewUrl), 100);
      } else {
        // --- Logic for DOWNLOADING (using the new helper) ---
        downloadFileFromResponse(response, `vehicle-report-${applicationCode}.pdf`);
      }

    } catch (err) {
      console.error('Failed to generate report:', err);
      toast({
        title: 'Report Generation Failed',
        description: 'There was an error creating the PDF. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPrintingCode(null);
    }
  };

  const fetchedData = response?.data?.content ?? [];
  const totalPages = response?.data?.totalPages ?? 0;     
  const totalElements = response?.data?.totalElements ?? 0;
  const currentPageNumber = response?.data?.number ?? 0;
  const currentPageSize = response?.data?.size ?? pageSize;

  const containerBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  // --- End Styling ---

  if (isLoading) 
  {
    return (
      <Flex justify="center" align="center" height="200px" mt={5}>
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="teal.500" size="xl" />
        <Text ml={4} fontSize="lg">Loading final entries...</Text>
      </Flex>
    );
  }

  if (isError) { 
    return (
      <Alert status="error" mt={5} borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Error Fetching Finals</Text>
          <Text>{error instanceof Error ? error.message : 'An unknown error occurred.'}</Text>
          <Text fontSize="sm">Please try refreshing the page or contact support.</Text>
        </Box>
      </Alert>
    );
  }
  
const startIndex = currentPageNumber * currentPageSize;

const endIndex = startIndex + fetchedData.length; 

const handleSearchChange = (newValue) =>
{
  setSearchTerm(newValue);
  setPageNumber(0);
};

  return (
    <Box p={{ base: 2, md: 4 }} mt={5} borderWidth="1px" borderRadius="md" bg={containerBg} shadow="sm">

      <Flex
        direction={{ base: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ base: 'stretch', md: 'center' }}
        mb={4}
        gap={4}
        flexWrap="wrap"
      >
        <VStack alignItems="flex-start" spacing={3}>
          <DTPageSizing
            pageSize={pageSize}
            setPageSize={(value) => 
                { 
                    setPageSize(Number(value)); 
                    setPageNumber(0); 
                }}
          />

        </VStack>

        {/* Right Side - Search Field */}
        <HStack spacing={2} width={{ base: '100%', md: 'auto' }}>
           <Text fontSize="sm" whiteSpace="nowrap" color={textColor}>Search:</Text>
           
           <SearchInput 
              searchText={searchTerm}
              setSearchText={handleSearchChange}
              size = "sm"
              maxW={{base: 'full', sm: '250px'}}
              flexGrow = {1}
           />
        </HStack>
      </Flex>

      <DataTableContainer> 
        <DataTable>
          <DThead>
            <DTr>
              <DTh>Reg. No</DTh>
              <DTh>Description</DTh>
              <DTh>Purchase Date</DTh>
              <DTh isNumeric>Dep. Value</DTh>
              <DTh isNumeric>Total Kms</DTh>
              <DTh>MVI Report</DTh>
              <DTh>Case Pending</DTh>
              <DTh>Actions</DTh>
            </DTr>
          </DThead>
          <DTbody>
            
             {isFetching && !isLoading && (
                <DTr>
                    <DTd colSpan={8} textAlign="center" py={4}>
                        <Spinner size="md" />
                    </DTd>
                </DTr>
             )}
            
            {!isFetching && fetchedData.length > 0 ? (
              fetchedData.map((row) => (
                <DTr key={row.applicationCode}>
                  <DTd><Text fontWeight="medium" color="teal.600">{row.registrationNo || 'N/A'}</Text></DTd>
                  <DTd>{row.vehicleDescription || 'N/A'}</DTd>
                  <DTd>{row.purchaseDate}</DTd>
                  <DTd isNumeric>{row.depreciatedValue?.toLocaleString() ?? 'N/A'}</DTd>
                  <DTd isNumeric>{row.totalKmsLogged?.toLocaleString() ?? 'N/A'}</DTd>
                  <DTd>
                    <Tag size="sm" colorScheme={row.mviReportsAvailable ? 'green' : 'red'} variant="outline">
                      {row.mviReportsAvailable ? 'Yes' : 'No'}
                    </Tag>
                  </DTd>
                  <DTd>
                    <Tag size="sm" colorScheme={row.anyCasePending ? 'red' : 'green'} variant="outline">
                      {row.anyCasePending ? 'Yes' : 'No'}
                    </Tag>
                  </DTd>

                  <DTd>
                    <Menu>
                      <MenuButton
                        as={Button}
                        size="sm"
                        variant="outline"
                        rightIcon={<MdArrowDownward />}
                        width="full"
                        isLoading={printingCode === row.applicationCode}
                        loadingText="Wait..."
                      >
                        Actions
                      </MenuButton>
                      <MenuList>
                        <MenuItem
                          onClick={() => handleGenerateReport(row.applicationCode, 'inline')}
                        >
                          View Report
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleGenerateReport(row.applicationCode, 'attachment')}
                        >
                          Download Report
                        </MenuItem>
                        <MenuItem
                          onClick={() => handleViewDetails(row.applicationCode)}
                        >
                          View Vehicle Details
                        </MenuItem>
                      </MenuList>
                    </Menu>
                  </DTd>
                </DTr>
              ))
            ) : null}
             {!isFetching && fetchedData.length === 0 && (
              <DTr>
                <DTd colSpan={8} textAlign="center" color={textColor} py={6}>
                  {debouncedSearchTerm ? 'No final entries match your search.' : 'No final entry available.'}
                </DTd>
              </DTr>
            )}
          </DTbody>
        </DataTable>
      </DataTableContainer>
      {/* --- End Table --- */}
      
{/* --- Pagination (Keep as is) --- */}
        <Flex
          direction={{ base: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          mt={4}
          gap={2}
          flexWrap="wrap"
        >
          {totalElements > 0 ?  (
            <>
            <Text fontSize="sm" color={textColor}>
                 Showing {startIndex + 1} to {endIndex} of {totalElements} entries
             </Text>
             {/* UNCOMMENT and wire up Pagination - Pass backend data */}
             <DTPagination
                 // Pass necessary props based on backend data
                 pageNumber={currentPageNumber} // Use backend's current page number (0-indexed)
                 setPageNumber={setPageNumber} // Function to change page state
                 totalPages={totalPages}
                 // Optional: Pass these if your component uses them
                 // pageSize={currentPageSize}
                 // totalElements={totalElements}
                 // You might need isDisabled flags based on isFetching or isPreviousData
                 isDisabled={isFetching || isPreviousData}
             />
             </>
         ) : (
             <Text fontSize="sm" color={textColor}>No entries found</Text>
         )}
      </Flex>
      {/* --- End Pagination --- */}

  <VehicleDetailsViewModal
        isOpen={isOpen}
        onClose={handleCloseModal}
        applicationCode={selectedAppCode}
      />
    </Box>
  );
};

export default FinalListDisplay;