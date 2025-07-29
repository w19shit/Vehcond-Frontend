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
    VStack,
    Flex,
    useColorModeValue,
    Spinner,
    Text,
    Checkbox // Using Chakra UI Checkbox directly
} from '@chakra-ui/react';

import {
    DataTableContainer,
    DataTable,
    DThead,
    DTr,
    DTh,
    DTbody,
    DTd
} from '../../components/core/DataTable'; // Assuming these are correctly set up

const PageAssignmentModal = ({
    isOpen,
    onClose,
    role, // For display purposes (e.g., role name)
    allPages, // Array of all page objects to display, e.g., [{ urlCode, processName, ... }]
    checkboxStates, // Object like { "urlCode1": true, "urlCode2": false }
    onCheckboxChange, // Function: (urlCode, isChecked) => void
    onAssignClick, // Function to trigger submission
    isAssigning, // Boolean: true if submission is in progress
    isLoadingPages, // Boolean: true if the list of allPages is loading
}) => {
    const textColor = useColorModeValue('gray.600', 'gray.400');

    if (!isOpen) { // Role check can be done by parent before opening
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            isCentered
            size="5xl"
            scrollBehavior="inside"
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader bg="lightblue">
                    <Text>Access Control for: {role?.roleName || role?.roleCode || 'Selected Role'}</Text>
                </ModalHeader>
                <ModalCloseButton isDisabled={isAssigning || isLoadingPages} />

                <ModalBody pb={6}>
                    <VStack spacing={4} align="stretch">
                        {isLoadingPages && (!allPages || allPages.length === 0) ? (
                            <Flex justify="center" align="center" minH="200px">
                                <Spinner size="xl" />
                                <Text ml={4}>Loading available pages...</Text>
                            </Flex>
                        ) : (
                            <DataTableContainer>
                                <DataTable>
                                    <DThead>
                                        <DTr>
                                            <DTh width="5%" textAlign="center">Assign</DTh>
                                            <DTh width="30%">Menu Header</DTh>
                                            <DTh width="30%">Sub Menu</DTh>
                                            <DTh width="35%">URL Path</DTh>
                                        </DTr>
                                    </DThead>
                                    <DTbody>
                                        {/* Refetching state can be managed by parent if needed via isLoadingPages */}
                                        {allPages && allPages.length > 0 ? (
                                            allPages.map((page, index) => (
                                                <DTr key={page.urlCode || index}>
                                                    <DTd textAlign="center">
                                                        <Checkbox
                                                            isChecked={checkboxStates[page.urlCode] || false}
                                                            onChange={(e) => onCheckboxChange(page.urlCode, e.target.checked)}
                                                            isDisabled={isAssigning}
                                                        />
                                                    </DTd>
                                                    <DTd>{page.processName || 'N/A'}</DTd>
                                                    <DTd>{page.subProcessName || 'N/A'}</DTd>
                                                    <DTd sx={{ wordBreak: 'break-all' }}>{page.pageUrl || 'N/A'}</DTd>
                                                </DTr>
                                            ))
                                        ) : (
                                            !isLoadingPages && (
                                                <DTr>
                                                    <DTd colSpan={4} textAlign="center" color={textColor} py={6}>
                                                        No pages available for assignment.
                                                    </DTd>
                                                </DTr>
                                            )
                                        )}
                                    </DTbody>
                                </DataTable>
                            </DataTableContainer>
                        )}
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button
                        colorScheme="green"
                        mr={3}
                        onClick={onAssignClick} // Trigger parent's submission logic
                        isLoading={isAssigning}
                        // Parent can determine if any changes were made to enable/disable
                        // isDisabled={isAssigning || isLoadingPages /* || !hasChanges (parent logic) */}
                        size="sm"
                    >
                        Assign Pages
                    </Button>
                    <Button
                        onClick={onClose}
                        size="sm"
                        variant="ghost"
                        isDisabled={isAssigning}
                    >
                        Cancel
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default PageAssignmentModal;