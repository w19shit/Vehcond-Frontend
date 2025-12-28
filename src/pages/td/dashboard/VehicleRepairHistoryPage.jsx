import { useState, useEffect, useMemo } from "react";
import {
  Box,
  HStack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Text,
  Input,
  Button,
  Badge,
  Spinner,
  Center,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  Textarea,
  ModalBody,
  VStack,
  Divider,
  SimpleGrid,
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VehicleRepairHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 New states
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [problemsForView, setProblemsForView] = useState([]);
  const [selectedRequestSummary, setSelectedRequestSummary] = useState(null);
const [manufacturer, setManufacturer] = useState(null);
const [vehicleType, setVehicleType] = useState(null);




  const rowsPerPage = 10;

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, history]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(
        `${BACKEND_URL}/repairrequest/vehicle/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );
      setHistory(res.data || []);
      setFilteredHistory(res.data || []);
    } catch (err) {
      console.error("Failed to load repair history", err);
    }
  };

   const fetchProblemsForRequest = async (requestId) => {
    const { data } = await axios.get(
      `${BACKEND_URL}/repairrequest/${requestId}/problems`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      }
    );
    return data;
  };

  const fetchManufacturer = async (id) => {
  const { data } = await axios.get(
    `${BACKEND_URL}/vehiclemanufacturer/${id}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};

const fetchVehicleType = async (id) => {
  const { data } = await axios.get(
    `${BACKEND_URL}/vehicletypes/${id}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};


  // 🔢 Repair count per vehicle
  const repairCountMap = useMemo(() => {
    const map = {};
    history.forEach((r) => {
      const reg = r.vehicle?.registrationNo;
      if (!reg) return;
      map[reg] = (map[reg] || 0) + 1;
    });
    return map;
  }, [history]);

  // 🔍 Search
  const applyFilters = () => {
    let filtered = [...history];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((r) =>
        r.vehicle?.registrationNo?.toLowerCase().includes(term)
      );
    }

    setFilteredHistory(filtered);
    setCurrentPage(1);
  };



  // Pagination
  const totalPages = Math.ceil(filteredHistory.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredHistory.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  if (!history.length)
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  return (
    <Flex direction="column" minH="75vh" bg="#f1f2f4" borderRadius="2xl">
      <Box flex="1" p={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6}>
          Vehicle Repair History
        </Heading>

        {/* 🔍 Search */}
        <Box bg="white" p={3} borderRadius="xl" mb={4} boxShadow="sm" w="500px">
          <HStack spacing={4}>
            <Input
              placeholder="Search by Registration No"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button colorScheme="gray" onClick={() => setSearchTerm("")}>
              Reset
            </Button>
          </HStack>
        </Box>

        {/* Table */}
        <Box bg="white" p={4} borderRadius="xl" shadow="md">
          <Box overflowX="auto" maxH="65vh">
            <Table minW="1000px" size="sm">
              <Thead bg="gray.100" position="sticky" top={0}>
                <Tr>
                  <Th>#</Th>
                  <Th>Registration No</Th>
                  <Th>Status</Th>
                  <Th>TD Approved Date</Th>
                  <Th>Estimate (₹)</Th>
                  <Th>Repair Count</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>

              <Tbody>
                {currentRows.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center" py={6}>
                      No records found
                    </Td>
                  </Tr>
                ) : (
                  currentRows.map((r, index) => (
                    <Tr key={r.id}>
                      <Td>{indexOfFirstRow + index + 1}</Td>
                      <Td>{r.vehicle?.registrationNo}</Td>

                      <Td>
                        <Badge colorScheme="yellow">{r.status}</Badge>
                      </Td>

                      <Td>
                        {r.tdApprovedDate
                          ? new Date(r.tdApprovedDate).toLocaleDateString()
                          : "-"}
                      </Td>

                      <Td>₹{r.estimateAmount ?? "-"}</Td>

                      <Td>
                        <Badge
                          colorScheme={
                            repairCountMap[r.vehicle?.registrationNo] >= 5
                              ? "red"
                              : repairCountMap[r.vehicle?.registrationNo] >= 3
                              ? "orange"
                              : "green"
                          }
                        >
                          {repairCountMap[r.vehicle?.registrationNo] || 0}
                        </Badge>
                      </Td>

                      {/* ✅ ACTION BUTTONS */}
                      <Td>
                        <HStack spacing={2}>
                          <Button
                            size="xs"
                            colorScheme="blue"
                            onClick={() => {
                              setSelectedRecord(r);
                              setSelectedRequestSummary(r); // summary object only
                              setIsVehicleModalOpen(true);  // ✅ VEHICLE MODAL
                            }}
                            
                          >
                            View Vehicle
                          </Button>


                          <Button
                            size="xs"
                            colorScheme="teal"
                            onClick={async () => {
                              setSelectedRecord(r);
                              setProblemsForView([]);        // 🔹 clear old data
                              setIsRepairModalOpen(true);

                              const data = await fetchProblemsForRequest(r.id); // 🔥 FETCH HERE

                              setProblemsForView(
                                data.map((p) => ({
                                  id: p.id,
                                  problemText: p.problemText ?? "",
                                }))
                              );
                            }}
                          >
                            View Repair Form
                          </Button>

                        </HStack>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          <Flex justify="center" align="center" gap={4} mt={4}>
            <Button
              onClick={() => setCurrentPage((p) => p - 1)}
              isDisabled={currentPage === 1}
            >
              Previous
            </Button>
            <Text fontWeight="semibold">
              Page {currentPage} of {totalPages}
            </Text>
            <Button
              onClick={() => setCurrentPage((p) => p + 1)}
              isDisabled={currentPage === totalPages}
            >
              Next
            </Button>
          </Flex>
        </Box>
      </Box>




      {/* 🔹 VEHICLE DETAILS MODAL */}
      <Modal
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        size="lg"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vehicle Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
  {selectedRecord ? (
    <VStack align="start" spacing={3}>

      <Text>
        <b>Registration No:</b>{" "}
        {selectedRecord.vehicle?.registrationNo || "-"}
      </Text>

      <Text>
        <b>Model:</b>{" "}
        {selectedRecord.vehicle?.model || "-"}
      </Text>

      <Text>
        <b>Department:</b>{" "}
        {selectedRequestSummary?.department?.departmentName || "-"}
      </Text>

      <Text>
        <b>Date Of Manufacturing:</b>{" "}
        {selectedRequestSummary?.vehicle?.dateOfManufacturing || "-"}
      </Text>
      <Text></Text>

    </VStack>
  ) : (
    <Text color="gray.500">No vehicle details available</Text>
  )}
</ModalBody>

        </ModalContent>
      </Modal>

      {/* 🔹 REPAIR FORM MODAL */}
       <Modal
          isOpen={isRepairModalOpen}
          onClose={() => setIsRepairModalOpen(false)}
          size="xl"
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Repair Form</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
            {selectedRecord && (
              <VStack align="stretch" spacing={5}>

                {/* 🔹 BASIC DETAILS (2 COLUMNS) */}
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>

                  {/* Registration */}
                  <Box>
                    <Text fontWeight="semibold">Vehicle Registration No</Text>
                    <Input
                      value={selectedRecord.vehicle?.registrationNo || "-"}
                      isReadOnly
                    />
                  </Box>

                  {/* Current KM Reading */}
                  <Box>
                    <Text fontWeight="semibold">Current Kilometer Reading</Text>
                    <Input
                      value={selectedRecord.kilometerReading || "-"}
                      isReadOnly
                    />
                  </Box>

                  {/* Location */}
                  <Box>
                    <Text fontWeight="semibold">Location</Text>
                    <Input
                      value={selectedRecord.location || "-"}
                      isReadOnly
                    />
                  </Box>

                  {/* Urgency */}
                  <Box>
                    <Text fontWeight="semibold">Urgency / Priority</Text>
                    <Input
                      value={selectedRecord.urgency || "-"}
                      isReadOnly
                    />
                  </Box>
                </SimpleGrid>

                {/* 🔹 DATE OF LAST SERVICE (FULL WIDTH) */}
                <Box>
                  <Text fontWeight="semibold">Date of Last Service</Text>
                  <HStack>
                    <Input
                      value={
                        selectedRecord.lastServiceDate
                          ? new Date(selectedRecord.lastServiceDate).getDate()
                          : "-"
                      }
                      isReadOnly
                    />
                    <Input
                      value={
                        selectedRecord.lastServiceDate
                          ? new Date(selectedRecord.lastServiceDate).toLocaleString(
                              "default",
                              { month: "long" }
                            )
                          : "-"
                      }
                      isReadOnly
                    />
                    <Input
                      value={
                        selectedRecord.lastServiceDate
                          ? new Date(selectedRecord.lastServiceDate).getFullYear()
                          : "-"
                      }
                      isReadOnly
                    />
                  </HStack>
                </Box>


                {/* 🔹 NATURE OF PROBLEMS (FULL WIDTH) */}
                <Box>
                  <Text fontWeight="semibold">Nature of Problems</Text>

                  {problemsForView.length === 0 ? (
                    <Text color="gray.500">No problems found</Text>
                  ) : (
                    problemsForView.map((p) => (
                      <Textarea
                        key={p.id}
                        value={p.problemText}
                        isReadOnly
                        mb={2}
                      />
                    ))
                  )}
                </Box>


                {/* 🔹 ESTIMATE SUMMARY (FULL WIDTH) */}
                <Box>
                  <Text fontWeight="bold">Estimate Summary</Text>
                  <Input
                    value={`₹ ${selectedRecord.estimateAmount ?? "-"}`}
                    isReadOnly
                  />
                </Box>
                <text></text>

              </VStack>
            )}
          </ModalBody>
          </ModalContent>
        </Modal>
    </Flex>
  );
};

export default VehicleRepairHistoryPage;
