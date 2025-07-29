import React, { useState } from 'react';
import {
  Box,
  Divider,
  useToast, 
  HStack,
  Button,
} from '@chakra-ui/react';

import AllottedTable from '../Msi_tableData/AllottedTable';
import { useFetchAllottedReportPDF, useFetchAllottedReportExcel} from '../../hooks/reportQueries';

// import AllotmentLetterPDFModal from '../../components/common/AllotmentLetterPDFModal';

const Allotted = () => 
{

 const [filterValues, setFilterValues] = useState({
    search: '',
    year: '',
    month: '',
  });

  const toast = useToast();
  
  // const[isModalOpen, setIsModadOpen] = useState(false);

  // const[selectedRowData, setSelectedRowData] = useState(null);

  const { 
    mutate: exportPDF,
    isPending: isExportingPdf,
  } = useFetchAllottedReportPDF();

  const { 
    mutate: exportExcel,
    isPending: isExportingExcel,
  } = useFetchAllottedReportExcel();

  // const handleModalOpen = (row) => {

  //   const modalData = {
  //     appNo : row?.applicationCode,
  //   }
  //   setSelectedRowData(modalData);
  //   setIsModadOpen(true);
  // }

  // const handleCloseModal = () =>{
  //   setIsModadOpen(false);
  //   setSelectedRowData(null);
  // }

  const handleSetSearch = (searchText) => {
    setFilterValues(prev => ({ ...prev, search: searchText }));
  };

  const handleSetYear = (yearValue) => {
    setFilterValues(prev => ({ ...prev, year: yearValue, month: '' }));
  };

  const handleSetMonth = (monthValue) => {
    setFilterValues(prev => ({ ...prev, month: monthValue }));
  };
  
      // const { data: profileData, isLoading: isLoadingProfile} = useFetchUsersProfile();
    
      // const profile = profileData?.data;
    
     const handleExport = (format) => {

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

    if (format === 'pdf') {
      exportPDF(params);
    } else if (format === 'xlsx') {
      exportExcel(params);
    }
  };
      
  return (
    <Box mt={5}>
        
      <AllottedTable
        filterValues={filterValues}
        setSearch={handleSetSearch}
        setYear={handleSetYear}
        setMonth={handleSetMonth}
        // onOpenModal={handleModalOpen}
      />
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
        
        {/* {selectedRowData && (
          <AllotmentLetterPDFModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            rowState={selectedRowData}
          />
        )} */}
    </Box>
  );
};

export default Allotted;