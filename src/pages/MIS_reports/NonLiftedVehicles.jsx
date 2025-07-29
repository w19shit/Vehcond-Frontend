import React, { useState } from 'react';
import {
  Box,
  Divider,
  useToast, 
  HStack,
  Button,
} from '@chakra-ui/react';


import NonLiftedVehicleTable from '../Msi_tableData/NonLiftedVehicleTable';

import { useFetchNonLiftedReportPDF, useFetchNonLiftedReportExcel } from '../../hooks/reportQueries'; 

const NonLiftedVehicle = () => 
{
   const [search, setSearch] = useState('');
      const [year, setYear] = useState('');
      const [month, setMonth] = useState('');
    
      const filterValues = { search, year, month};
    
      const toast = useToast();
      const { 
        mutate: exportPDF,
        isPending: isExportingPdf,
      } = useFetchNonLiftedReportPDF();
      const { 
        mutate: exportExcel,
        isPending: isExportingExcel,
      } = useFetchNonLiftedReportExcel();
    
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

        const params = {year, month: month || undefined}

        if(format === 'pdf')
        {
          exportPDF(params);
        }
        else if(format === 'excel')
        {
          exportExcel(params);
        }
      };
  

  return (
    <Box mt={5}>
        
        <NonLiftedVehicleTable   
          filterValues={filterValues}
          setSearch={setSearch}
          setYear={setYear}
          setMonth={setMonth} 
        />
           <HStack spacing={5} mt={4} justifyContent="center">
                   <Button 
                     size="md" 
                     colorScheme="red" 
                     onClick={() => handleExport('pdf')}
                     // isLoading={isExporting}
                     loadingText="Generating..."
                   >
                     Export PDF
                   </Button>
                   <Button 
                     size="md"  
                     colorScheme="green" 
                     onClick={() => handleExport('excel')}
                     // isLoading={isExporting}
                     loadingText="Generating..."
                   >
                     Export Excel
                   </Button>
                 </HStack>  
     
    </Box>
  );
};

export default NonLiftedVehicle;