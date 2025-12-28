import { useState, useEffect } from "react";
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
  useToast,
  Flex,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const AllotedVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const rowsPerPage = 10;
  const toast = useToast();

  useEffect(() => {
    fetchVehicleTypes();
    fetchManufacturers();
    fetchDepartments();
    fetchVehicles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedDept, vehicles]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

  const fetchVehicleTypes = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/vehicle-type`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setVehicleTypes(res.data);
    } catch (err) {
      console.error("Error fetching vehicle types:", err);
    }
  };

  const fetchManufacturers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/vehicle-manufacturer`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setManufacturers(res.data);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/department/all-for-selection`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const normalized = res.data.map((d) => ({
        departmentCode: d.departmentCode ?? d.departmentcode,
        departmentName: d.departmentName ?? d.departmentname,
      }));
      setDepartments(normalized);
    } catch (err) {
      console.error("Error fetching departments:", err);
    }
  };

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/poolparked/allotted`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      const filtered = res.data.filter((v) => v.processCode >= 18);
      setVehicles(filtered);
      setFilteredVehicles(filtered);
    } catch (err) {
      console.error("Error fetching vehicles:", err);
      toast({
        title: "Error",
        description: "Could not load vehicles.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // ✅ Apply search + filter logic
  const applyFilters = () => {
    let filtered = [...vehicles];

    if (selectedDept) {
      filtered = filtered.filter((v) => {
        const dept = departments.find((d) => d.departmentCode === v.departmentId);
        return dept && dept.departmentName === selectedDept;
      });
    }

    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((v) => {
        const dept = departments.find((d) => d.departmentCode === v.departmentId);
        const deptName = dept?.departmentName?.toLowerCase() || "";
        const regNo = v.registrationNo?.toLowerCase() || "";
        return deptName.includes(term) || regNo.includes(term);
      });
    }

    setFilteredVehicles(filtered);
    setCurrentPage(1);
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstRow, indexOfLastRow);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleReset = () => {
    setSelectedDept("");
    setSearchTerm("");
    setFilteredVehicles(vehicles);
    setCurrentPage(1);
  };

  return (
    <Flex direction="column" minH="75vh" bg="#f1f2f4" borderRadius="2xl">
      <Box flex="1" p={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6}>
          Allotted Vehicles
        </Heading>

        {/* 🔍 Filters */}
        <Box bg="white" p={3} borderRadius="xl" mb={4} boxShadow="sm"  w="700px">
        <HStack mb={1} spacing={4} align="center">
          <Select
            placeholder="Filter by Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            w="250px"
          >
            {departments.map((d) => (
              <option key={d.departmentCode} value={d.departmentName}>
                {d.departmentName}
              </option>
            ))}
          </Select>

          <Input
            placeholder="Search by Department / Reg. No"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            w="300px"
          />

          <Button colorScheme="gray" onClick={handleReset}>
            Reset
          </Button>
        </HStack>
        </Box>

        {/* Table Container */}
        <Box bg="white" p={4} borderRadius="xl" shadow="md">
          <Box overflowX="auto" overflowY="auto" maxH="65vh">
            <Table minW="1000px" variant="simple" size="sm">
              <Thead bg="gray.100" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th>#</Th>
                  <Th>Registration No</Th>
                  <Th>Department</Th>
                  <Th>Type</Th>
                  <Th>Manufacturer</Th>
                  <Th>Model</Th>
                  <Th textAlign="center">Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentVehicles.length === 0 ? (
                  <Tr>
                    <Td colSpan="7" textAlign="center" py={6}>
                      No vehicles found.
                    </Td>
                  </Tr>
                ) : (
                  currentVehicles.map((v, index) => (
                    <Tr key={v.id} _hover={{ bg: "gray.50" }}>
                      <Td>{indexOfFirstRow + index + 1}</Td>
                      <Td>{v.registrationNo}</Td>
                      <Td>
                        {
                          departments.find(
                            (d) => d.departmentCode === v.departmentId
                          )?.departmentName || ""
                        }
                      </Td>
                      <Td>
                        {
                          vehicleTypes.find(
                            (t) => t.vehicleTypeCode === v.vehicleTypeId
                          )?.vehicletypedescription || ""
                        }
                      </Td>
                      <Td>
                        {
                          manufacturers.find(
                            (m) => m.vehicleManufacturerCode === v.manufacturerId
                          )?.vehicleManufacturerName || ""
                        }
                      </Td>
                      <Td>{v.model}</Td>
                      <Td textAlign="center">
                        <Button
                          size="sm"
                          colorScheme="blue"
                          onClick={() => setSelectedVehicle(v)}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination Controls */}
          <Flex justify="center" align="center" gap={4} mt={4}>
            <Button onClick={handlePrevPage} isDisabled={currentPage === 1}>
              Previous
            </Button>
            <Text fontWeight="semibold">
              Page {currentPage} of {totalPages}
            </Text>
            <Button onClick={handleNextPage} isDisabled={currentPage === totalPages}>
              Next
            </Button>
          </Flex>
        </Box>
      </Box>

      {/* Floating Form Overlay */}
      {selectedVehicle && (
        <Flex
          position="fixed"
          top="14"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(4px)"
          align="center"
          justify="center"
          zIndex={50}
          p={{ base: 3, md: 4 }}
        >
          <Box
            bg="white"
            p={6}
            borderRadius="xl"
            shadow="2xl"
            w={{ base: "95%", md: "750px" }}
            maxH="85vh"
            overflowY="auto"
          >
            <Heading size="md" mb={3}>
              Vehicle Details
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl>
                <FormLabel>Department</FormLabel>
                <Input
                  value={
                    departments.find(
                      (d) => d.departmentCode === selectedVehicle.departmentId
                    )?.departmentName || ""
                  }
                  isReadOnly
                />
              </FormControl>

              <FormControl>
                <FormLabel>Vehicle Type</FormLabel>
                <Input
                  value={
                    vehicleTypes.find(
                      (t) => t.vehicleTypeCode === selectedVehicle.vehicleTypeId
                    )?.vehicletypedescription || ""
                  }
                  isReadOnly
                />
              </FormControl>

              <FormControl>
                <FormLabel>Manufacturer</FormLabel>
                <Input
                  value={
                    manufacturers.find(
                      (m) =>
                        m.vehicleManufacturerCode === selectedVehicle.manufacturerId
                    )?.vehicleManufacturerName || ""
                  }
                  isReadOnly
                />
              </FormControl>

              <FormControl>
                <FormLabel>Model</FormLabel>
                <Input value={selectedVehicle.model} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Registration No</FormLabel>
                <Input value={selectedVehicle.registrationNo} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Chassis No</FormLabel>
                <Input value={selectedVehicle.chassisNo} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Engine No</FormLabel>
                <Input value={selectedVehicle.engineNo} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Purchase Date</FormLabel>
                <Input value={formatDate(selectedVehicle.purchaseDate)} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Date of Manufacturing</FormLabel>
                <Input
                  value={formatDate(selectedVehicle.dateOfManufacturing)}
                  isReadOnly
                />
              </FormControl>

              <FormControl>
                <FormLabel>Purchase Cost</FormLabel>
                <Input value={selectedVehicle.purchaseCost} isReadOnly />
              </FormControl>

              <FormControl>
                <FormLabel>Vehicle Description</FormLabel>
                <Input value={selectedVehicle.vehicleDescription} isReadOnly />
              </FormControl>
            </SimpleGrid>
            <Flex justify="flex-end" mt={6}>
              <Button colorScheme="red" onClick={() => setSelectedVehicle(null)}>
                Close
              </Button>
            </Flex>
          </Box>
        </Flex>
      )}
    </Flex>
  );
};

export default AllotedVehiclesPage;
