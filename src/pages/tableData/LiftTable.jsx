// LiftTable.js

import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  Button,
  useColorModeValue,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  HStack,
  Heading,
  useToast, 
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

import { useFetchAllottedVehicles, useLifitngVehicle } from '../../hooks/transportActions'; 
import LiftingVehicleModal from '../../components/common/LiftingVehicleModal'; 
import AllotmentLetterPDFModal from '../../components/common/AllotmentLetterPDFModal';

const LiftTable = () => {
    
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm] = useDebounce(searchTerm, 500);

  const [isLiftingModalOpen, setIsLiftingModal] = useState(false);
  const [vehicleForLifting, setVehicleForLifting] = useState(null);

  const [isLetterModalOpen, setIsLetterModalOpen] = useState(false);
  const [vehicleForLetter, setVehicleForLetter] = useState(null);
  
  const toast = useToast();

  const {
    data: response,
    isLoading: isLoadingVehicles,
    isError,
    error,
    isFetching,
    isPreviousData
  } = useFetchAllottedVehicles(pageNumber, pageSize, debouncedSearchTerm);

  const { mutate: liftVehicleMutate, isLoading: isLifting } = useLifitngVehicle();

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

  // --- Modal Control Functions ---
  const handleOpenLiftModal = (vehicle) => {
    setVehicleForLifting(vehicle);
    setIsLiftingModal(true);
  };

  const handleCloseLiftModal = () => {
    setVehicleForLifting(null);
    setIsLiftingModal(false);
  };

  const handleOpenLetterModal = (row) => {
    const letterData = {
        appNo: row?.applicationCode,
    }

    setVehicleForLetter(letterData);
    setIsLetterModalOpen(true);
  }

  const handleCloseLetterModal = () => {
    setIsLetterModalOpen(false);
    setVehicleForLetter(null);
  }

  // --- Form Submission Handler (Passed to Modal) ---
  const handleLiftSubmit = (formData) => {
    // The mutationFn `liftingVehicle` expects an object { data: formData }
    liftVehicleMutate(
      { data: formData },
      {
        onSuccess: (responseData) => {
          toast({
            title: 'Vehicle Lifted',
            description: `Vehicle ${formData.registrationNo} has been processed.`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
          handleCloseLiftModal();
          // queryClient.invalidateQueries is already handled by the hook's onSuccess
        },
        onError: (error) => {
          toast({
            title: 'Lifting Failed',
            description: error.message || 'An error occurred while lifting the vehicle.',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          // console.log is already handled by the hook's onError
        },
      }
    );
  };


  // --- Render Logic ---
  return (
    <Box p={{ base: 2, md: 4 }} borderWidth="1px" borderRadius="md" bg={containerBg} shadow="sm">
        <Heading size="md" mb={4} color={textColor}>Lift Pending Vehicles</Heading>

        {isLoadingVehicles && ( // Use renamed isLoading
             <Flex justify="center" align="center" height="200px">
                <Spinner /> <Text ml={3}>Loading Vehicles...</Text>
             </Flex>
        )}

        {isError && (
            <Alert status="error" borderRadius="md" mb={4}>
                <AlertIcon />
                <Box>
                    <Text fontWeight="bold">Error Fetching Vehicles</Text>
                    <Text>{error instanceof Error ? error.message : 'An unknown error occurred.'}</Text>
                </Box>
            </Alert>
        )}

        {!isLoadingVehicles && !isError && (
            <>
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
                            setPageSize={(value) => {
                                setPageSize(Number(value));
                                setPageNumber(0);
                            }}
                        />
                    </VStack>
                    <HStack spacing={2} width={{ base: '100%', md: 'auto' }}>
                        <Text fontSize="sm" whiteSpace="nowrap" color={textColor}>Search:</Text>
                        <Input
                            size="sm"
                            placeholder="Reg No, Description..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setPageNumber(0);
                            }}
                            maxW={{ base: 'full', sm: '250px' }}
                            flexGrow={1}
                        />
                    </HStack>
                </Flex>

                <DataTableContainer>
                    <DataTable>
                        <DThead>
                            <DTr>
                                <DTh>Registration Number</DTh>
                                <DTh>Vehicle Description</DTh>
                                <DTh>Purchase Date</DTh>
                                <DTh isNumeric>Deprecated Value</DTh>
                                <DTh isNumeric>Total Kms Logged</DTh>
                                <DTh>Allottes Name</DTh>
                                <DTh>Allottes Address</DTh>
                                <DTh>Actions</DTh>
                            </DTr>
                        </DThead>
                        <DTbody>
                            {isFetching && (
                                <DTr>
                                    <DTd colSpan={8} textAlign="center" py={4} position="relative">
                                        <Flex justify="center" align="center" position="absolute" inset={0}>
                                            <Spinner size="md" />
                                        </Flex>
                                    </DTd>
                                </DTr>
                            )}
                            {!isFetching && fetchedData.length > 0 ? (
                                fetchedData.map((row) => (
                                    <DTr key={row.applicationCode}>
                                        <DTd><Text fontWeight="medium" color="teal.600">{row?.registrationNo || 'N/A'}</Text></DTd>
                                        <DTd>{row.vehicleDescription || 'N/A'}</DTd>
                                        <DTd>{row.purchaseDate }</DTd>
                                        <DTd isNumeric>{row.depreciatedValue?.toLocaleString() ?? 'N/A'}</DTd>
                                        <DTd isNumeric>{row.totalKmsLogged?.toLocaleString() ?? 'N/A'}</DTd>
                                        <DTd>{row.allotteesname}</DTd>
                                        <DTd>{row.allotteesaddress}</DTd>
                                        <DTd>
                                            <HStack spacing={2}>
                                                <Button
                                                  size="xs"
                                                  colorScheme="teal"
                                                  variant="outline"
                                                  onClick={() => handleOpenLiftModal(row)}
                                                  isLoading={isLifting && vehicleForLifting?.applicationCode === row.applicationCode}
                                                >
                                                    Lift
                                                </Button>
                                                <Button
                                                  size="xs"
                                                  colorScheme="blue"
                                                  variant="outline"
                                                  onClick={() => handleOpenLetterModal(row)}
                                                //   isLoading={isLifting && vehicleForLifting?.applicationCode === row.applicationCode}
                                                >
                                                    View Allotment Letter. 
                                                </Button>
                                            </HStack>
                                        </DTd>
                                    </DTr>
                                ))
                            ) : null}
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

        {/* Render the Modal */}
        {vehicleForLifting && (
            <LiftingVehicleModal
                isOpen={isLiftingModalOpen}
                onClose={handleCloseLiftModal}
                vehicle={vehicleForLifting}
                onSubmit={handleLiftSubmit} // Pass the submit handler
                isLoading={isLifting}      // Pass the mutation's loading state
            />
        )}

        {vehicleForLetter && (
            <AllotmentLetterPDFModal 
                isOpen={isLetterModalOpen}
                onClose={handleCloseLetterModal}
                rowState={vehicleForLetter}
            />
        )}
    </Box>
  );
};

export default LiftTable;