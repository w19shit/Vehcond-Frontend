import React, { useMemo } from 'react';
import {
    Box,
    Button,
    useColorModeValue,
    useToast,
    VStack,
    Spinner,
    Stack,
    Text
} from '@chakra-ui/react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

import InputField from "../../../components/core/formik/InputField";
import SelectField from "../../../components/core/formik/SelectField";

import { useFetchDepartmentForSelect } from '../../../hooks/dataEntryQueries';
import { useFetchRoleForSelect } from '../../../hooks/adminActions';
import { useRegisterUser } from '../../../hooks/authQueries';

const validationSchema = Yup.object().shape({
    username: Yup
        .string()
        .required('Username is required'),
    password: Yup
        .string()
        .matches(/(?=.*[a-z])/, "At least 1 lowercase letter")
        .matches(/(?=.*[A-Z])/, "At least 1 uppercase letter")
        .matches(/(?=.*\d)/, "At least 1 number")
        .matches(/(?=.*[#^@$!%*?&])/, "At least 1 special character")
        .min(8, "New Password must be between 8 to 255 characters")
        .max(255, "New Password must be between 8 to 255 characters")
        .required('Password is required'),
    name: Yup
        .string()
        .required('Name of User is required'),
    departmentCode: Yup
        .number()
        .required('Department is required'),
    rolecode: Yup
        .number()
        .required('Role is required'),
    userAccess: Yup
        .string()
        .required('User Access is required'),
});

const UserCreationForm = () => {
    const toast = useToast();
    const {
        mutate: registerUserMutate,
        isLoading: isCreatingUser,
    } = useRegisterUser();

    const {
        data: departmentData,
        isLoading: isLoadingDepartments,
        isError: isErrorDepartments,
        error: departmentsError
    } = useFetchDepartmentForSelect();

    const {
        data: rolesData,
        isLoading: isLoadingRoles,
        isError: isErrorRoles,
        error: rolesError
    } = useFetchRoleForSelect();

    const containerBg = useColorModeValue('white', 'gray.800');

    const sortedDepartments = useMemo(() => {
        if (departmentData?.data && Array.isArray(departmentData.data)) {
            return [...departmentData.data].sort((a, b) =>
                a.departmentName.localeCompare(b.departmentName)
            );
        }
        return [];
    }, [departmentData]);

    const sortedRoles = useMemo(() => {
        if (rolesData?.data && Array.isArray(rolesData.data)) {
            return [...rolesData.data].sort((a, b) =>
                a.role.localeCompare(b.role)
            );
        }
        return [];
    }, [rolesData]);

    const initialValues = {
        username: '',
        password: '',
        name: '',
        departmentCode: '',
        rolecode: '',
        userAccess: '',
    };
    
    // --- THIS FUNCTION WAS MISSING. IT IS NOW RESTORED. ---
    // This function wraps our logic so it only runs on form submission.
    const handleSubmit = (values, formikActions) => {
        const payload = {
            username: values.username,
            password: values.password,
            name: values.name,
            departmentCode: parseInt(values.departmentCode, 10),
            rolecode: parseInt(values.rolecode, 10),
            userAccess: values.userAccess === 'true' 
        };

        console.log("Submitting payload:", payload);

        // The mutation is called *inside* the submit handler
        registerUserMutate(payload, {
            onSuccess: (response) => {
                console.log('User created successfully:', response);
                toast({
                    title: "User Created",
                    description: `User "${values.username}" has been successfully created.`,
                    status: "success",
                    duration: 5000,
                    isClosable: true,
                    position: "top-right",
                });
                formikActions.resetForm();
            },
            onError: (error) => {
                console.error('User creation failed:', error);
                toast({
                    title: "Error Creating User",
                    description: error?.response?.data?.error || error.message || "An unexpected error occurred.",
                    status: "error",
                    duration: 7000,
                    isClosable: true,
                    position: "top-right",
                });
            },
            onSettled: () => {
                formikActions.setSubmitting(false);
            }
        });
    }; // <- The closing brace for handleSubmit

    if (isLoadingDepartments || isLoadingRoles) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" h="200px">
                <Spinner size="xl" />
                <Text ml={3}>Loading data...</Text>
            </Box>
        );
    }

    if (isErrorDepartments) {
        return (
            <Box color="red.500" p={5} borderWidth="1px" borderRadius="md" borderColor="red.300" bg="red.50">
                <Text fontWeight="bold">Error loading departments:</Text>
                <Text>{departmentsError?.message || "An unexpected error occurred."}</Text>
            </Box>
        );
    }

    if (isErrorRoles) {
        return (
            <Box color="red.500" p={5} borderWidth="1px" borderRadius="md" borderColor="red.300" bg="red.50">
                <Text fontWeight="bold">Error loading roles:</Text>
                <Text>{rolesError?.message || "An unexpected error occurred."}</Text>
            </Box>
        );
    }

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
                onSubmit={handleSubmit} // This now correctly points to our function
                enableReinitialize
            >
                {(formikProps) => (
                    <Form>
                        <VStack spacing={4} align="stretch">
                            <InputField name="username" label="Username" placeholder="Enter a username" isRequired={true} size="md" />
                            <InputField name="password" label="Password" placeholder="Enter a password" type="password" isRequired={true} size="md" />
                            <InputField name="name" label="Name of User" placeholder="Enter the full name of the user" isRequired={true} size="md" />
                            <SelectField name="departmentCode" label="Department" placeholder="Select Department" isRequired={true}>
                                {sortedDepartments?.map((department) => (
                                    <option key={department.departmentCode} value={department.departmentCode}>
                                        {department.departmentName}
                                    </option>
                                ))}
                            </SelectField>
                            <SelectField name="rolecode" label="Role" placeholder="Select Role" isRequired={true}>
                                {sortedRoles?.map((role) => (
                                    <option key={role.rolecode} value={role.rolecode}>
                                        {role.role}
                                    </option>
                                ))}
                            </SelectField>
                            <SelectField name="userAccess" label="User Access" placeholder="Select User Access" isRequired={true}>
                                <option value="true">Enable</option>
                                <option value="false">Disable</option>
                            </SelectField>
                            <Stack
                                direction={{ base: 'column', sm: 'row' }}
                                spacing={3}
                                justifyContent="center"
                                width="100%"
                                pt={4}
                            >
                                <Button
                                    type="submit"
                                    colorScheme="blue"
                                    isLoading={isCreatingUser}
                                    loadingText="Creating..."
                                    isDisabled={isCreatingUser || !formikProps.isValid || !formikProps.dirty}
                                    w={{ base: '100%', sm: 'auto' }}
                                >
                                    Create User
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => formikProps.resetForm()}
                                    variant="outline"
                                    isDisabled={isCreatingUser || !formikProps.dirty}
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

export default UserCreationForm;