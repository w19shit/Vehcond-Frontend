import React, { useState } from 'react';
import {
  Box,
  Divider,
  useToast, 
  HStack,
  Button,
} from '@chakra-ui/react';


// Import the child table components
import CirculationListTable from '../Msi_tableData/CirculationListTable';

import { useFetchCirculationReportPDF, useFetchCirculationReportExcel } from '../../hooks/reportQueries';
import { useFetchUsersProfile } from '../../hooks/userQueries';

const CirculationList = () => {
  const [filterValues, setFilterValues] = useState({
      search: '',
      year: '',
      month: '',
    });
  
    const toast = useToast();
    const { 
      mutate: exportPDF,
      isPending: isExportingPdf,
    } = useFetchCirculationReportPDF();
    const { 
      mutate: exportExcel,
      isPending: isExportingExcel,
    } = useFetchCirculationReportExcel();
  
    const handleSetSearch = (searchText) => {
    setFilterValues(prev => ({ ...prev, search: searchText }));
  };

  const handleSetYear = (yearValue) => {
    // CRITICAL: When the year changes, reset the month in the same update!
    setFilterValues(prev => ({ ...prev, year: yearValue, month: '' }));
  };

  const handleSetMonth = (monthValue) => {
    setFilterValues(prev => ({ ...prev, month: monthValue }));
  };
    const { data: profileData, isLoading: isLoadingProfile} = useFetchUsersProfile();
  
    const profile = profileData?.data;
  
    const handleExport = (format) => {
    // Use the values from the state object
    const params = { year: filterValues.year || undefined, month: filterValues.month || undefined };

     if (params.month && !params.year) {
        toast({
            title: "Invalid Selection",
            description: "You cannot select a month without selecting a year.",
            status: "warning",
            duration: 4000,
            isClosable: true,
            position: "top",
        });
        return;
    }

      if(format === 'pdf')
      {
        exportPDF(params)
      }
      else if(format === 'xlsx')
      {
        exportExcel(params);
      }
      
    };

    const canExport = profile && (profile.role === 'ADMIN' || profile.role === 'TD');

  return (
    <Box mt={5}>
        <CirculationListTable
          filterValues={filterValues}
          setSearch={handleSetSearch}
          setYear={handleSetYear}
          setMonth={handleSetMonth}
        />

         {canExport && (

      <HStack spacing={5} mt={4} justifyContent="center">
              <Button 
                size="md" 
                colorScheme="red" 
                onClick={() => handleExport('pdf')}
                isLoading={isExportingPdf}
                loadingText="Generating..."
              >
                Export PDF
              </Button>
              <Button 
                size="md"  
                colorScheme="green" 
                onClick={() => handleExport('xlsx')}
                isLoading={isExportingExcel}
                loadingText="Generating..."
              >
                Export Excel
              </Button>
            </HStack>  
                )}
    </Box>
  );
};

export default CirculationList;