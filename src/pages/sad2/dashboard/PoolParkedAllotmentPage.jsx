import { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  SimpleGrid,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Select,
  Input,
  FormControl,
  FormLabel,
  Flex,
  Text,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  Divider
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const PoolParkedAllotmentPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [form, setForm] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const cancelRef = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const vehiclesPerPage = 10;
  const toast = useToast();

  useEffect(() => {
    fetchVehicleTypes();
    fetchManufacturers();
    fetchDepartments();
    fetchVehicles();
  }, []);
  useEffect(() => {
      filterData();
    }, [searchTerm, vehicles]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };

    // ✅ Filtering
  const filterData = () => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = vehicles.filter((req) => {
      const matchesSearch =
        req.vehicle?.registrationNo?.toLowerCase().includes(lowerSearch) ||
        req.registrationNo?.toLowerCase().includes(lowerSearch);
      return matchesSearch;
    });
    setFilteredVehicles(filtered);
    setCurrentPage(1);
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
    const res = await axios.get(`${BACKEND_URL}/poolparked/all`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
    });

    // ✅ Normalize data
    const normalized = res.data.map((v) => ({
      ...v,
      departmentId: v.departmentId || 0,
    }));

    // ✅ Filter only vehicles with processCode === 17
    const filtered = normalized.filter((v) => v.processCode === 17);

    setVehicles(filtered);
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


  const handleAllot = (vehicle) => {
    const purchaseD = vehicle.purchaseDate ? new Date(vehicle.purchaseDate) : null;
    const manufD = vehicle.dateOfManufacturing ? new Date(vehicle.dateOfManufacturing) : null;

    setSelectedVehicle(vehicle);

    setForm({
      id: vehicle.id,
      departmentId:"",
      vehicleTypeId: vehicle.vehicleTypeId || "",
      manufacturerId: vehicle.manufacturerId || "",
      model: vehicle.model || "",
      registrationNo: vehicle.registrationNo || "",
      chassisNo: vehicle.chassisNo || "",
      engineNo: vehicle.engineNo || "",
      purchaseDay: purchaseD ? purchaseD.getDate() : "",
      purchaseMonth: purchaseD ? purchaseD.getMonth() + 1 : "",
      purchaseYear: purchaseD ? purchaseD.getFullYear() : "",
      manufactureDay: manufD ? manufD.getDate() : "",
      manufactureMonth: manufD ? manufD.getMonth() + 1 : "",
      manufactureYear: manufD ? manufD.getFullYear() : "",
      purchaseCost: vehicle.purchaseCost || "",
      vehicleDescription: vehicle.vehicleDescription || "",
    });
  };

  const handleConfirmOpen = () => {
    if (form.departmentId === 0 || form.departmentId === "" || isNaN(form.departmentId)){
      toast({
        title: "Validation Error",
        description: "Please select a department.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirmClose = () => setIsConfirmOpen(false);

  const handleConfirmSubmit = async () => {
    setIsConfirmOpen(false);
    await handleSubmit();
  };

  const handleSubmit = async () => {
     if (form.departmentId === -1 || form.departmentId === "") {
      toast({
        title: "Validation Error",
        description: "Please select a department.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const payload = { vehicleId: form.id, departmentId: form.departmentId };
      await axios.post(`${BACKEND_URL}/poolparked/allot`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });

      toast({
        title: "Success",
        description: "Vehicle allotted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setSelectedVehicle(null);
      fetchVehicles();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to allot vehicle",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / vehiclesPerPage);
  const indexOfLastVehicle = currentPage * vehiclesPerPage;
  const indexOfFirstVehicle = indexOfLastVehicle - vehiclesPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstVehicle, indexOfLastVehicle);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };
  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

    const handleReset = () => {
    setSearchTerm("");
    setFilteredVehicles(vehicles);
    setCurrentPage(1);
  };

  return (
    <Flex direction="column" minH="73vh" bg="#f1f2f4" borderRadius="2xl">
      <Box
        flex="1"
        p={{ base: 4, md: 8 }}
        spacing={9}
        filter={selectedVehicle ? "blur(6px)" : "none"}
        transition="filter 0.3s ease"
      >
        <Heading size="lg" mb={6}>
          Pool/Parked Vehicles
        </Heading>

      {/* 🔍 Filters */}
      <Box bg="white" p={3} borderRadius="xl" mb={4} boxShadow="sm" w="400px">
         <HStack mb={1} spacing={4} align="center">
           <Input
             placeholder="Search by Reg. No"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             w="300px"
           />
 
           <Button colorScheme="gray" onClick={handleReset}>
             Reset
           </Button>
         </HStack>
         </Box>       

        <Box bg="white" p={4} borderRadius="xl" shadow="md">
          <Box overflowX="auto" overflowY="auto" maxH="65vh">
            <Table minW="1000px" variant="simple" size="sm">
              <Thead bg="gray.100" position="sticky" top={0} zIndex={1}>
                <Tr>
                  <Th>#</Th>
                  <Th>Registration No</Th>
                  <Th>Type</Th>
                  <Th>Manufacturer</Th>
                  <Th>Model</Th>
                  <Th>Purchase Date</Th>
                  <Th>Date of Manufacturing</Th>
                  <Th>Cost</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentVehicles.map((v, index) => (
                  <Tr key={v.id} _hover={{ bg: "gray.50" }}>
                    <Td>{indexOfFirstVehicle + index + 1}</Td>
                    <Td>{v.registrationNo}</Td>
                    <Td>
                      {vehicleTypes.find(
                        (t) => t.vehicleTypeCode === v.vehicleTypeId
                      )?.vehicletypedescription || ""}
                    </Td>
                    <Td>
                      {manufacturers.find(
                        (m) => m.vehicleManufacturerCode === v.manufacturerId
                      )?.vehicleManufacturerName || ""}
                    </Td>
                    <Td>{v.model}</Td>

                    <Td>{formatDate(v.purchaseDate)}</Td>
                    <Td>{formatDate(v.dateOfManufacturing)}</Td>
                    <Td>{v.purchaseCost}</Td>
                    <Td>
                      <Button size="sm" colorScheme="blue" onClick={() => handleAllot(v)}>
                        Take Action
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

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
            w={{ base: "95%", md: "750px" }}   // 🔹 reduced width from 900px → 750px
            maxH="85vh"                        // 🔹 slightly smaller height
            overflowY="auto"
          >
            <Heading size="md" mb={3}>
              Vehicle Details
            </Heading>

            {/* Form content */}
            <Box px={2} pb={4}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Vehicle Type */}
                <FormControl>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Input
                    value={
                      vehicleTypes.find(
                        (t) => t.vehicleTypeCode === form.vehicleTypeId
                      )?.vehicletypedescription || ""
                    }
                    isReadOnly
                  />
                </FormControl>

                {/* Manufacturer */}
                <FormControl>
                  <FormLabel>Manufacturer</FormLabel>
                  <Input
                    value={
                      manufacturers.find(
                        (m) => m.vehicleManufacturerCode === form.manufacturerId
                      )?.vehicleManufacturerName || ""
                    }
                    isReadOnly
                  />
                </FormControl>

                {/* Model */}
                <FormControl>
                  <FormLabel>Model</FormLabel>
                  <Input value={form.model} isReadOnly />
                </FormControl>

                {/* Registration No */}
                <FormControl>
                  <FormLabel>Registration No</FormLabel>
                  <Input value={form.registrationNo} isReadOnly />
                </FormControl>

                {/* Chassis No */}
                <FormControl>
                  <FormLabel>Chassis No</FormLabel>
                  <Input value={form.chassisNo} isReadOnly />
                </FormControl>

                {/* Engine No */}
                <FormControl>
                  <FormLabel>Engine No</FormLabel>
                  <Input value={form.engineNo} isReadOnly />
                </FormControl>

                {/* Purchase Date */}
                <FormControl>
                  <FormLabel>Purchase Date</FormLabel>
                  <Input
                    value={formatDate(selectedVehicle.purchaseDate)}
                    isReadOnly
                  />
                </FormControl>

                {/* Date of Manufacturing */}
                <FormControl>
                  <FormLabel>Date of Manufacturing</FormLabel>
                  <Input
                    value={formatDate(selectedVehicle.dateOfManufacturing)}
                    isReadOnly
                  />
                </FormControl>

                {/* Purchase Cost */}
                <FormControl>
                  <FormLabel>Purchase Cost</FormLabel>
                  <Input value={form.purchaseCost} isReadOnly />
                </FormControl>

                {/* Vehicle Description */}
                <FormControl>
                  <FormLabel>Vehicle Description</FormLabel>
                  <Input value={form.vehicleDescription} isReadOnly />
                </FormControl>

                {/* Department dropdown */}
                <FormControl isRequired gridColumn={{ base: "span 1", md: "span 2" }}>
                  <Divider my={4}  border="2px" />
                  <FormLabel>Department</FormLabel>
                  <Select
                    name="departmentId"
                    value={form.departmentId === 0 ? "" : String(form.departmentId)}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        departmentId:
                          e.target.value === "" ? 0 : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Select Department to allot vehicle to</option>
                    {departments.map((d) => (
                      <option key={d.departmentCode} value={String(d.departmentCode)}>
                        {d.departmentName}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </SimpleGrid>
            </Box>
            <Flex justify="flex-end" gap={3} mt={6}>
              <Button colorScheme="green" onClick={handleConfirmOpen}>
                Submit Allotment
              </Button>
              <Button variant="outline" onClick={() => setSelectedVehicle(null)}>
                Cancel
              </Button>
            </Flex>
          </Box>
        </Flex>
      )}


      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isConfirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={handleConfirmClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Vehicle Allotment
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to allot this vehicle to the selected department?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={handleConfirmClose}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleConfirmSubmit} ml={3}>
                Yes, Allot Vehicle
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

    </Flex>
  );
};

export default PoolParkedAllotmentPage;
