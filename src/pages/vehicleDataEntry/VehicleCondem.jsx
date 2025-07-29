import React from 'react';
import { Stack, Radio, HStack, Box, Text } from '@chakra-ui/react'; 
import InputField from '../../components/core/formik/InputField';
import TextAreaField from '../../components/core/formik/TextAreaField';
import RadioGroupField from '../../components/core/formik/RadioGroupField';
import PartsCondition from './PartsCondition'; 

const VehicleCondem = ({ values, setFieldValue, handleMviReportChange }) => { // Added setFieldValue for consistency
    // The handleMviReportChange prop is passed from VehicleRegistrationForm
    // and is responsible for updating formik's 'mvireportavailable' field
    // and clearing dependent fields.

    // Conditional logic for accidentcaseresolved based on whetheraccident
    const showAccidentCaseResolved = values.whetheraccident === 'Y';

    return (
        <Stack spacing={4}>
            {/* Total Km Logged */}
            <InputField
                name="totalkms"
                label="Total Kilometers logged"
                type="number"
                // isRequired visual cue
            />

            {/* Depreciated Value */}
            <InputField
                name="depreciatedamount"
                label="Depreciated value of the vehicle"
                type="number"
                // isRequired visual cue
            />

            <TextAreaField
                name="improvements"
                label="Improvement or additional fitments made, if any, and cost thereof"
                isRequired={false} // Align with Yup (optional)
            />

            <InputField
                name="expenses"
                label="Total expenditure incurred in respect of P.O.L, if borne by the Government"
                type="number"
                // isRequired={false} // If Yup schema makes it optional, align this for visual cue
                // Your Yup schema has it as required: .required("Total POL Expenditure cannot be blank")
            />

            <InputField
                name="repairexpenses"
                label="Total expenditure incurred on maintenance till now"
                type="number"
                // isRequired={false} // If Yup schema makes it optional, align this for visual cue
                // Your Yup schema has it as required
            />

            <InputField
                name="repairslastsixmonths"
                label="Repairs (costing over Rs. 1,000) undertaken during the last 6 (six) months before the proposal for condemnation or before the vehicle was shut down"
                type="number"
                // isRequired={false} // If Yup schema makes it optional, align this for visual cue
                // Your Yup schema has it as required
            />

            <RadioGroupField
                name="whetheraccident"
                label="Whether the vehicle has met with an accident"
                // isRequired is from Yup
                onChange={(value) => { // Assuming RadioGroupField's onChange passes the value directly
                    setFieldValue("whetheraccident", value);
                    if (value === "N") {
                        setFieldValue("accidentcaseresolved", ""); // Clear if 'No'
                    }
                }}
            >
                <HStack spacing={5}> {/* Added spacing */}
                    <Radio value="Y">Yes</Radio>
                    <Radio value="N">No</Radio>
                </HStack>
            </RadioGroupField>

            {/* Conditionally render accidentcaseresolved */}
            {showAccidentCaseResolved && (
                <RadioGroupField
                    name="accidentcaseresolved"
                    label="If yes, whether the case in connection with the accident has been settled"
                    // isRequired is from Yup (conditionally)
                >
                    <HStack spacing={5}> {/* Added spacing */}
                        <Radio value="Y">Yes</Radio>
                        <Radio value="N">No</Radio>
                        {/* Consider adding an "N/A" or "Pending" if applicable */}
                    </HStack>
                </RadioGroupField>
            )}

            <TextAreaField
                name="comments"
                label="Views/Comments of the Departmental officer"
                // isRequired is from Yup
            />

            <RadioGroupField
                name="mvireportavailable"
                label="Is MVI Report Available?" // Simplified label
                // isRequired is from Yup
                // The onChange here will call the handleMviReportChange from VehicleRegistrationForm
                // This ensures Formik's value for mvireportavailable is set AND conditional fields are cleared.
                onChange={handleMviReportChange} // Pass the function reference
            >
                <HStack spacing={5}> {/* Added spacing */}
                    <Radio value="Y">Yes</Radio>
                    <Radio value="N">No</Radio>
                </HStack>
            </RadioGroupField>

            {/* Conditionally render MVI related fields */}
            {values.mvireportavailable === 'Y' && (
                <Box pl={0} mt={4} pt={4} borderTopWidth="1px" borderColor="gray.200"> {/* Added visual separator */}
                    <Text fontWeight="bold" fontSize="lg" mb={4}>MVI Report Details</Text>
                    <Stack spacing={4}> {/* Nested stack for MVI fields */}
                        <PartsCondition /> {/* Renders the list of part conditions */}

                        <InputField
                            name="battery"
                            label="Battery Condition"
                            // isRequired (conditionally by Yup)
                        />
                        <InputField
                            name="tyres"
                            label="Tyres Condition"
                            // isRequired (conditionally by Yup)
                        />
                        <TextAreaField
                            name="accidentdamage"
                            label="Accident damage of vehicle (from history sheet)"
                            // isRequired (conditionally by Yup)
                        />
                        <InputField
                            name="mviprice"
                            label="MVI's assessment of current value"
                            type="number"
                            // isRequired (conditionally by Yup)
                        />
                        <TextAreaField
                            name="mviremarks"
                            label="Views/Comments of the MVI officer"
                            // isRequired (conditionally by Yup)
                        />
                    </Stack>
                </Box>
            )}
        </Stack>
    );
};

export default VehicleCondem;