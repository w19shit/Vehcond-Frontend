import React from 'react';
import {
    Box,
    Button,
    useColorModeValue,
    useToast,
    VStack,
    Stack,
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import InputField from "../../../components/core/formik/InputField";
import { useAddRoleNameRequest } from '../../../hooks/adminActions';

const validationSchema = Yup.object().shape({
    role: Yup.string().required('Role name is required'),
    description: Yup.string(), // optional
});

const RoleForm = () => {
    const toast = useToast();
    const { mutate: addRoleMutate, isLoading: isAddingRole } = useAddRoleNameRequest();
    const containerBg = useColorModeValue('white', 'gray.800');

    const initialValues = {
        role: '',
        description: '',
    };

    const handleSubmit = (values, formikActions) => {
        console.log("Form values to submit:", values);
        formikActions.setSubmitting(true);

        addRoleMutate(values, {
            onSuccess: (response) => {
                console.log('Role inserted successfully. Server response:', response);
                toast({
                    title: "Role Added",
                    description: `Role "${values.role}" has been successfully added.`,
                    status: "success",
                    duration: 3000,
                    isClosable: true,
                    position: "top-right",
                });
                formikActions.resetForm();
            },
            onError: (error) => {
                console.error('Role insertion failed:', error);
                toast({
                    title: "Error Adding Role",
                    description: error?.response?.data || error?.message || "An unexpected error occurred.",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
            },
            onSettled: () => {
                formikActions.setSubmitting(false);
            }
        });
    };

    return (
        <Box
            p={{ base: 4, sm: 6, md: 8 }}
            borderWidth="1px"
            borderRadius="md"
            bg={containerBg}
            shadow="sm"
            maxW={{ base: 'md', lg: 'xl' }}
            mx="auto"
            w="100%"
            mb={6}
        >
            <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {(formikProps) => (
                    <Form>
                        <VStack spacing={4} align="stretch">
                            <InputField
                                name="role"
                                label="Role Name"
                                placeholder="Enter new role name"
                                isRequired
                                size="md"
                            />
                            <InputField
                                name="description"
                                label="Description"
                                placeholder="Optional description"
                                size="md"
                            />

                            <Stack
                                direction={{ base: 'column', sm: 'row' }}
                                spacing={3}
                                justifyContent="center"
                                width="100%"
                            >
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    isLoading={formikProps.isSubmitting || isAddingRole}
                                    loadingText="Submitting..."
                                    isDisabled={formikProps.isSubmitting || isAddingRole || !formikProps.isValid || !formikProps.dirty}
                                    w={{ base: '100%', sm: 'auto' }}
                                >
                                    Submit
                                </Button>
                                <Button
                                    type="button"
                                    onClick={formikProps.handleReset}
                                    variant="outline"
                                    isDisabled={isAddingRole || !formikProps.dirty}
                                    w={{ base: '100%', sm: 'auto' }}
                                >
                                    Reset
                                </Button>
                            </Stack>
                        </VStack>
                    </Form>
                )}
            </Formik>
        </Box>
    );
};

export default RoleForm;
