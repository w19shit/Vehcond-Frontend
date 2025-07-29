import React, { useState } from 'react';
import {
  Box,
  Divider,
  useToast, 
  HStack,
  Button,
} from '@chakra-ui/react';


import ScrappedTable from '../Msi_tableData/ScrappedTable';

import { useFetchScrappedReportPDF, useFetchScrappedReportExcel} from '../../hooks/reportQueries';
import { useFetchUsersProfile } from '../../hooks/userQueries';

const Scrapped = () => 
{
  const [search, setSearch] = useState('');
     const [year, setYear] = useState('');
     const [month, setMonth] = useState('');
   
     const filterValues = { search, year, month};
   
     const toast = useToast();
     const { 
       mutate: exportPDF,
       isPending: isExportingPdf,
     } = useFetchScrappedReportPDF();
     const { 
       mutate: exportExcel,
       isPending: isExportingExcel,
     } = useFetchScrappedReportExcel();

     const { data: profileData, isLoading: isLoadingProfile} = useFetchUsersProfile();
   
     const profile = profileData?.data;
   
     const handleExport = (format) => {
       if(!year || !month)
       {
         toast({
           title: "Selection Required",
           description: "Please select both a year and a month to generate a report.",
           status: "warning",
           duration: 4000,
           isClosable: true,
           position: "top",
         });
         return;
       }

       const params = { year, month: month || undefined}

         if(format === 'pdf')
         {
          exportPDF(params);
         }
         else if(format === 'xlsx')
         {
          exportExcel(params);
         }
     };
const canExport = profile && (profile.role === 'ADMIN' || profile.role === 'TD');

  return (
    <Box mt={5}>
        
        <ScrappedTable  filterValues={filterValues}
          setSearch={setSearch}
          setYear={setYear}
          setMonth={setMonth}/>
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
                      onClick={() => handleExport('excel')}
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

export default Scrapped;