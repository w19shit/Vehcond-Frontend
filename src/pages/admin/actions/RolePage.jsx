import React, { useState, useEffect, useCallback } from 'react';

import {
    Box,
    useToast,
    useDisclosure 
} from '@chakra-ui/react';

import RoleTable from '../../tableData/RoleTable';
import RoleForm from '../dataInsertion/RoleForm';
import PageAssignmentModal from '../../../components/common/PageAssignmentModal';

import { useFetchPageUrl } from '../../../hooks/dataEntryQueries';
import { useFetchAssignedRolePages, useAssignPages } from '../../../hooks/assignPagesQueries';

const RolePage = () => {

    const { isOpen, onOpen, onClose } = useDisclosure();
    const toast = useToast(); 

    const [ selectedRole, setSelectedRole] = useState(null);
    const [ checkboxStates, setCheckboxStates] = useState({});

    const {
        data: allPagesResponse,
        isLoading: isLoadingAllPages
    } = useFetchPageUrl();

    const allPages = allPagesResponse?.data || [];

    const {
        data: assignedPagesResponse 
    } = useFetchAssignedRolePages(selectedRole?.rolecode);

    const assignedPagesIds = assignedPagesResponse?.data || [];

    const {
        mutate: assignPages, 
        isPending: isAssigning
    } = useAssignPages();

    useEffect(() => {
        if(isOpen && allPages.length > 0)
        {
            const initialStates = {};
            allPages.forEach(page => {
                initialStates[page.urlCode] = assignedPagesIds.includes(page.urlCode);
            });
            setCheckboxStates(initialStates);
        }
    }, [isOpen, allPages, assignedPagesIds]);

    const handleOpenModal = (roleFromTable) => {
        setSelectedRole(roleFromTable);
        onOpen();

        // if (!roleFromTable || !allAvailablePages) {
        //     toast({
        //         title: "Cannot Open Modal",
        //         description: "Role data or available pages are not ready.",
        //         status: "warning",
        //         duration: 3000,
        //         isClosable: true,
        //     });
        //     return;
        };

    const handleCloseModal = () => {
        onClose();
        
        setTimeout(() => {
            setSelectedRole(null);
            setCheckboxStates({});
        }, 300); 
    };

    const handleCheckboxChange = (urlCode, isChecked) => {
        setCheckboxStates(prevStates => ({
            ...prevStates,
            [urlCode]: isChecked,
        }));
    };

    // TODO: Handle Modal submission.
    const handleAssignPagesSubmit = async () => {
        if (!selectedRole) return;

        const pageIdsToAssign = Object.keys(checkboxStates)
            .filter(key => checkboxStates[key] === true)
            .map(Number);
        assignPages(
            { 
                roleCode: selectedRole.rolecode,
                pageIds: pageIdsToAssign,
            },
            {
                onSuccess: () => {
                    toast({
                        title: 'Success',
                        description: `Assignments updated for role: ${selectedRole.role}.`,
                        status: 'success',
                        duration: 4000,
                        isClosable: true,
                    });
                    handleCloseModal();
                },
                onError: (error) => {
                    toast({
                        title: 'Assignment Failed',
                        description: error.response?.data?.message || 'An unknown error occurred.',
                        status: 'error',
                        duration: 5000,
                        isClosable: true,
                    });
                },
            }
        );
    };

    return (
        <Box mt={5}>
            <RoleForm />
            <RoleTable onOpenModal={handleOpenModal} />

             <PageAssignmentModal
                isOpen={isOpen}
                onClose={handleCloseModal}
                role={selectedRole}
                allPages={allPages}
                checkboxStates={checkboxStates}
                onCheckboxChange={handleCheckboxChange}
                onAssignClick={handleAssignPagesSubmit}
                isAssigning={isAssigning} // The loading state from our useAssignPages hook
                isLoadingPages={isLoadingAllPages}
            />
        </Box>
    );
};

export default RolePage;