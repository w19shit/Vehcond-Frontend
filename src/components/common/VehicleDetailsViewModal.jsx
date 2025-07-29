import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stack,
  Box,
  Text,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';

import DetailItem from './DetailItem'; 

import { useFetchVehicleDetails } from '../../hooks/transportActions'; 

const VehicleDetailsViewModal = ({ isOpen, onClose, applicationCode }) => {
  const { 
    data: response, 
    isLoading, 
    isError, 
    error 
  } = useFetchVehicleDetails(applicationCode);

  const vehicle = response?.data;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {isLoading && "Loading Details..."}
          {isError && "Error"}
          {vehicle && `Vehicle Details: ${vehicle.rtoCode || ''} ${vehicle.vehicleRegistrationNumber || ''}`}
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody pb={6} minH="300px">
          {isLoading && (
            <Flex justify="center" align="center" h="100%">
              <Spinner size="xl" color="teal.500" />
            </Flex>
          )}

          {isError && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              <Box>
                <Text fontWeight="bold">Could not fetch vehicle details.</Text>
                <Text fontSize="sm">{error?.message || "An unknown error occurred."}</Text>
              </Box>
            </Alert>
          )}

          {vehicle && !isLoading && !isError && (
            <Tabs isFitted variant="enclosed-colored" colorScheme="teal">
              <TabList>
                <Tab>Office Records</Tab>
                <Tab>Vehicle Information</Tab>
                <Tab>Condemnation Details</Tab>
              </TabList>
              <TabPanels>

           {/* ======================= TAB 1: OFFICE RECORDS ======================= */}
                <TabPanel>
                  <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.200" />}>
                    <DetailItem label="District" value={vehicle.registeredDistrict} />
                    <DetailItem label="Department" value={vehicle.departmentName} />
                    <DetailItem label="Financial Year" value={vehicle.financialYear} />
                    <DetailItem label="Name of the office" value={vehicle.officeName} />
                    <DetailItem label="Officer's Designation" value={vehicle.officerDesignation} />
                    <DetailItem label="Premises" value={vehicle.premises} isTextArea />
                    <DetailItem label="Address 1" value={vehicle.address1} isTextArea />
                    <DetailItem label="Address 2" value={vehicle.address2} isTextArea />
                    <DetailItem label="Directorate Letter No." value={vehicle.directorateLetterNo} />
                    <DetailItem label="Directorate Letter Date" value={vehicle.directorateLetterDate} />
                    <DetailItem label="Govt. Forwarding Letter No." value={vehicle.forwardingLetterNo} />
                    <DetailItem label="Govt. Forwarding Letter Date" value={vehicle.govForwardingLetterDate} />
                  </Stack>
                </TabPanel>

                {/* ======================= TAB 1: VEHICLE INFORMATION ======================= */}
                <TabPanel>
                  <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.200" />}>
                    <DetailItem label="Vehicle Category" value={vehicle.vehicletypename} />
                    <DetailItem label="Description of Vehicle" value={vehicle.vehicledescription} isTextArea />
                    <DetailItem label="Vehicle Manufacturer" value={vehicle.vehiclemanufacturercode} />
                    <DetailItem label="Engine Number" value={vehicle.engineno} />
                    <DetailItem label="Chassis Number" value={vehicle.chassisno} />
                    <DetailItem label="Year of manufacturer" value={vehicle.manufactureyear} />
                    <DetailItem label="Date of purchase" value={vehicle.purchasedate} />
                    <DetailItem label="Vehicle purchase price" value={vehicle.vehicleprice?.toLocaleString()} />
                  </Stack>
                </TabPanel>

     
                
                {/* ======================= TAB 3: CONDEMNATION DETAILS ======================= */}
                <TabPanel>
                  <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.200" />}>
                    <DetailItem label="Total Kilometers Logged" value={vehicle.totalkms?.toLocaleString()} />
                    <DetailItem label="Depreciated Value" value={vehicle.depreciatedamount?.toLocaleString()} />
                    <DetailItem label="Improvements / Fitments" value={vehicle.improvements} isTextArea />
                    <DetailItem label="Met with Accident?" value={vehicle.whetheraccident === 'Y' ? 'Yes' : 'No'} />
                    {vehicle.whetheraccident === 'Y' && (
                      <DetailItem label="Accident Case Settled?" value={vehicle.accidentcaseresolved === 'Y' ? 'Yes' : 'No'} />
                    )}
                    <DetailItem label="Departmental Officer's Comments" value={vehicle.comments} isTextArea />
                    <DetailItem label="MVI Report Available?" value={vehicle.mvireportavailable === 'Y' ? 'Yes' : 'No'} />
                    
                    {vehicle.mvireportavailable === 'Y' && (
                      <Box pt={4} mt={3} borderTopWidth="2px" borderColor="teal.100">
                        <Text fontWeight="bold" fontSize="lg" mb={2} color="teal.600">MVI Report Details</Text>
                        <Stack spacing={0} divider={<Box borderBottomWidth="1px" borderColor="gray.200" />}>
                          {vehicle.vehiclePartsFinal?.map((part, index) => (
                            <DetailItem key={index} label={part.vehiclepartname} value={part.condition} isTextArea />
                          ))}
                          <DetailItem label="Battery Condition" value={vehicle.battery} />
                          <DetailItem label="Tyres Condition" value={vehicle.tyres} />
                          <DetailItem label="Accident Damage" value={vehicle.accidentdamage} isTextArea />
                          <DetailItem label="MVI's Assessed Value" value={vehicle.mviprice?.toLocaleString()} />
                          <DetailItem label="MVI Officer's Remarks" value={vehicle.mviremarks} isTextArea />
                        </Stack>
                      </Box>
                    )}
                  </Stack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          )}
        </ModalBody>
        {/* <ModalFooter>
          <Button colorScheme="gray" onClick={onClose}>Close</Button>
        </ModalFooter> */}
      </ModalContent>
    </Modal>
  );
};

export default VehicleDetailsViewModal;