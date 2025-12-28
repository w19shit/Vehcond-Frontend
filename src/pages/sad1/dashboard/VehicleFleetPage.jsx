import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  SimpleGrid,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Flex,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const VehicleFleetPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [ setIsViewMode] = useState(false);
  const [isDiscardAlertOpen, setIsDiscardAlertOpen] = useState(false);
  const [vehicleToDiscard, setVehicleToDiscard] = useState(null);
  const cancelRef = React.useRef();
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [form, setForm] = useState({
    id: null,
    departmentId: 38,
    vehicleTypeId: "",
    manufacturerId: "",
    model: "",
    registrationNo: "",
    chassisNo: "",
    engineNo: "",
    purchaseDay: "",
    purchaseMonth: "",
    purchaseYear: "",
    manufactureDay: "",
    manufactureMonth: "",
    manufactureYear: "",
    purchaseCost: "",
    vehicleDescription: "",
    processCode: 17,
  });

  const toast = useToast();

  useEffect(() => {
    fetchVehicleTypes();
    fetchManufacturers();
    fetchVehicles();
  }, []);
  const handleView = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsViewMode(true);
};


const confirmDiscard = (vehicleId) => {
  setVehicleToDiscard(vehicleId);
  setIsDiscardAlertOpen(true);
};

const handleDiscardConfirmed = async () => {
  if (!vehicleToDiscard) return;

  try {
    await axios.put(
      `${BACKEND_URL}/poolparked/${vehicleToDiscard}/discard`,
      { processCode: -4 },
      { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
    );
    setVehicles((prev) => prev.filter((v) => v.id !== vehicleToDiscard));
    toast({
      title: "Vehicle Discarded",
      description: "Vehicle successfully discarded.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  } catch (err) {
    console.error("Error discarding vehicle:", err);
    toast({
      title: "Error",
      description: "Could not discard vehicle.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsDiscardAlertOpen(false);
    setVehicleToDiscard(null);
  }
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

  const fetchVehicles = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/poolparked/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });
      setVehicles(res.data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const resetForm = () => {
    setForm({
      id: null,
      departmentId: 38,
      vehicleTypeId: "",
      manufacturerId: "",
      model: "",
      registrationNo: "",
      chassisNo: "",
      engineNo: "",
      purchaseDay: "",
      purchaseMonth: "",
      purchaseYear: "",
      manufactureDay: "",
      manufactureMonth: "",
      manufactureYear: "",
      purchaseCost: "",
      vehicleDescription: "",
    });
  };

  const handleSave = async () => {
    // ✅ Registration Number: supports ML01A1234, ML01AA1234, ML01AAA1234
    const regPattern = /^[A-Z]{2}\d{2}[A-Z]{1,3}\d{4}$/;
    if (!regPattern.test(form.registrationNo)) {
      toast({
        title: "Invalid Registration Number",
        description:
          "Format: 2 letters, 2 digits, 1–3 letters, 4 digits (e.g. ML01A1234, ML01AA1234, ML01AAA1234).",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // ✅ Chassis Number: 6–17 alphanumeric
    const chassisPattern = /^[A-Z0-9]{6,17}$/;
    if (!chassisPattern.test(form.chassisNo)) {
      toast({
        title: "Invalid Chassis Number",
        description: "Chassis number must be alphanumeric and 6–17 characters long.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // ✅ Engine Number: 5–15 alphanumeric
    const enginePattern = /^[A-Z0-9]{5,15}$/;
    if (!enginePattern.test(form.engineNo)) {
      toast({
        title: "Invalid Engine Number",
        description: "Engine number must be alphanumeric and 5–15 characters long.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
      return;
    }

    // ✅ Required fields check
    if (!form.vehicleTypeId || !form.manufacturerId || !form.registrationNo) {
      toast({
        title: "Missing required fields",
        description: "Please fill all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const payload = {
      departmentId: form.departmentId,
      vehicleTypeId: Number(form.vehicleTypeId),
      manufacturerId: Number(form.manufacturerId),
      model: form.model,
      registrationNo: form.registrationNo,
      chassisNo: form.chassisNo,
      engineNo: form.engineNo,
      purchaseDate:
        form.purchaseYear && form.purchaseMonth && form.purchaseDay
          ? `${form.purchaseYear}-${String(form.purchaseMonth).padStart(2, "0")}-${String(form.purchaseDay).padStart(2, "0")}`
          : null,
      dateOfManufacturing:
        form.manufactureYear && form.manufactureMonth && form.manufactureDay
          ? `${form.manufactureYear}-${String(form.manufactureMonth).padStart(2, "0")}-${String(form.manufactureDay).padStart(2, "0")}`
          : null,
      purchaseCost: form.purchaseCost ? Number(form.purchaseCost) : null,
      vehicleDescription: form.vehicleDescription || null,
      processCode: form.processCode  || 17,
    };

    try {
      let res;
      if (form.id) {
        res = await axios.put(`${BACKEND_URL}/poolparked/${form.id}`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        setVehicles(vehicles.map((v) => (v.id === form.id ? res.data : v)));
        toast({
          title: "Vehicle Updated",
          description: "Vehicle successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        res = await axios.post(`${BACKEND_URL}/poolparked/add`, payload, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        setVehicles([...vehicles, res.data]);
        toast({
          title: "Vehicle Added",
          description: "Vehicle successfully added.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
      resetForm();
    } catch (err) {
      console.error("Error saving vehicle:", err);
      toast({
        title: "Error",
        description: "Could not save vehicle.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };


  const handleEdit = (vehicle) => {
    const purchaseD = new Date(vehicle.purchaseDate);
    const manufD = vehicle.dateOfManufacturing ? new Date(vehicle.dateOfManufacturing) : null;

    setForm({
      id: vehicle.id,
      departmentId: vehicle.departmentId,
      vehicleTypeId: vehicle.vehicleTypeId,
      manufacturerId: vehicle.manufacturerId,
      model: vehicle.model,
      registrationNo: vehicle.registrationNo,
      chassisNo: vehicle.chassisNo,
      engineNo: vehicle.engineNo,
      purchaseDay: purchaseD.getDate(),
      purchaseMonth: purchaseD.getMonth() + 1,
      purchaseYear: purchaseD.getFullYear(),
      manufactureDay: manufD ? manufD.getDate() : "",
      manufactureMonth: manufD ? manufD.getMonth() + 1 : "",
      manufactureYear: manufD ? manufD.getFullYear() : "",
      purchaseCost: vehicle.purchaseCost,
      vehicleDescription: vehicle.vehicleDescription || "",
      processCode: form.processCode || 18 ,
    });

    setCurrentPage(1);
  };
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  // Filter active vehicles
  const activeVehicles = vehicles.filter((v) => v.processCode === 17);
;

  // Pagination logic: 5 on first page, 10 on next pages
  const startIndex = currentPage === 1 ? 0 : 5 + (currentPage - 2) * 10;
  const endIndex = currentPage === 1 ? 5 : startIndex + 10;
  const currentData = activeVehicles.slice(startIndex, endIndex);
  const totalPages = activeVehicles.length <= 5 ? 1 : 1 + Math.ceil((activeVehicles.length - 5) / 10);

  const formatForTable = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  return (
   <Flex direction="column" minH="83vh" bg="#f1f2f4" p={6} borderRadius="2xl">
    <Stack spacing={6}>
      <Heading size="lg" color="black">
        New Vehicle Entry
      </Heading>

      {/* Show form only on page 1 */}
      {currentPage === 1 && (
        <Box bg="white" p={6} shadow="md" borderRadius="xl">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            <FormControl isRequired>
              <FormLabel>Department</FormLabel>
              <Input value="SAD" isReadOnly />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Vehicle Type</FormLabel>
              <Select name="vehicleTypeId" value={form.vehicleTypeId} onChange={handleChange}>
                <option value="">Select Vehicle Type</option>
                {vehicleTypes.map((t) => (
                  <option key={t.vehicleTypeCode} value={t.vehicleTypeCode}>
                    {t.vehicletypedescription}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Manufacturer</FormLabel>
              <Select name="manufacturerId" value={form.manufacturerId} onChange={handleChange}>
                <option value="">Select Manufacturer</option>
                {manufacturers.map((m) => (
                  <option key={m.vehicleManufacturerCode} value={m.vehicleManufacturerCode}>
                    {m.vehicleManufacturerName}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Model</FormLabel>
              <Input name="model" value={form.model} onChange={handleChange} placeholder="Enter Model" />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Vehicle Description</FormLabel>
              <Input
                name="vehicleDescription"
                value={form.vehicleDescription}
                onChange={handleChange}
                placeholder="Enter Description"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Date of Manufacturing</FormLabel>
              <Stack direction="row" spacing={2}>
                <Select name="manufactureDay" value={form.manufactureDay} onChange={handleChange}>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select name="manufactureMonth" value={form.manufactureMonth} onChange={handleChange}>
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
                <Select name="manufactureYear" value={form.manufactureYear} onChange={handleChange}>
                  <option value="">Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </Stack>
            </FormControl>

            {/* Registration Number */}
            <FormControl isRequired>
              <FormLabel>Registration No</FormLabel>
              <Input
                name="registrationNo"
                value={form.registrationNo}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setForm({ ...form, registrationNo: val });
                }}
                placeholder="e.g. ML01ABC1234"
                maxLength={11}
              />
            </FormControl>

            {/* Chassis Number */}
            <FormControl isRequired>
              <FormLabel>Chassis No</FormLabel>
              <Input
                name="chassisNo"
                value={form.chassisNo}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setForm({ ...form, chassisNo: val });
                }}
                placeholder="17-character Chassis Number or VIN"
                maxLength={17}
              />
            </FormControl>

            {/* Engine Number */}
            <FormControl isRequired>
              <FormLabel>Engine No</FormLabel>
              <Input
                name="engineNo"
                value={form.engineNo}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setForm({ ...form, engineNo: val });
                }}
                placeholder="Enter Engine Number (up to 20 chars)"
                maxLength={20}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Purchase Date</FormLabel>
              <Stack direction="row" spacing={2}>
                <Select name="purchaseDay" value={form.purchaseDay} onChange={handleChange}>
                  <option value="">Day</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </Select>
                <Select name="purchaseMonth" value={form.purchaseMonth} onChange={handleChange}>
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
                <Select name="purchaseYear" value={form.purchaseYear} onChange={handleChange}>
                  <option value="">Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Select>
              </Stack>
            </FormControl>

            <FormControl>
              <FormLabel>Purchase Cost</FormLabel>
              <Input
                type="number"
                name="purchaseCost"
                value={form.purchaseCost}
                onChange={handleChange}
                placeholder="Enter Vehicle Cost"
                maxLength={9}
              />
            </FormControl>
          </SimpleGrid>

          <Flex justify="flex-end" gap={3} mt={4}>
            <Button colorScheme="gray" onClick={resetForm}>
              Clear Form
            </Button>
            <Button colorScheme="blue" onClick={handleSave}>
              {form.id ? "Update Vehicle" : "Add Vehicle"}
            </Button>
          </Flex>
        </Box>
      )}

      {/* Table Section */}
      <Box bg="white" p={6} shadow="md" borderRadius="xl" overflowX="auto">
        {currentPage !== 1 && (
          <Flex justify="flex-end" mb={2}>
            <Button colorScheme="blue" onClick={() => setCurrentPage(1)}>
              Add Vehicle
            </Button>
          </Flex>
        )}

        <Table variant="simple" size="sm">
          <Thead bg="gray.100">
            <Tr>
              <Th>Sl. No.</Th>
              <Th>Registration No</Th>
              <Th>Type</Th>
              <Th>Manufacturer</Th>
              <Th>Model</Th>
              <Th>Purchase Date</Th>
              <Th>Cost</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {currentData.map((v, index) => (
              <Tr key={v.id}>
                <Td>{startIndex + index + 1}</Td>
                <Td>{v.registrationNo}</Td>
                <Td>{vehicleTypes.find((t) => t.vehicleTypeCode === v.vehicleTypeId)?.vehicletypedescription || ""}</Td>
                <Td>{manufacturers.find((m) => m.vehicleManufacturerCode === v.manufacturerId)?.vehicleManufacturerName || ""}</Td>
                <Td>{v.model}</Td>
                <Td>{formatForTable(v.purchaseDate)}</Td>
                <Td>{v.purchaseCost}</Td>
                <Td>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => {
                        // Store vehicle ID in localStorage
                        localStorage.setItem("vehicleId", v.id);

                        // Open the vehicle details modal
                        handleView(v);
                      }}
                    >
                      View
                    </Button>

                    <Button size="sm" colorScheme="teal" onClick={() => handleEdit(v)}>
                      Edit
                    </Button>
                    <Button size="sm" colorScheme="red" onClick={() => confirmDiscard(v.id)}>
                      Discard
                    </Button>
                  </Flex>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>

       {selectedVehicle && (
        <Flex
          position="fixed"
          top="14"
          left="0"
          right="0"
          bottom="0"
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="blur(3px)"
          align="center"
          justify="center"
          zIndex={50}
          p={{ base: 4, md: 6 }}
        >
          <Box
            bg="white"
            p={8}
            borderRadius="xl"
            shadow="2xl"
            w={{ base: "95%", md: "900px" }}
            maxH="90vh"
            overflowY="auto"
          >
            <Heading size="md" textAlign="flex-start" mb={6} color="blue.600">
              Vehicle Details
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              {/* ✅ Vehicle Type */}
              <FormControl isReadOnly>
                <FormLabel>Vehicle Type</FormLabel>
                <Input
                  value={
                    vehicleTypes.find(
                      (t) =>
                        String(t.vehicleTypeCode) ===
                        String(selectedVehicle.vehicleTypeId)
                    )?.vehicletypedescription || "N/A"
                  }
                />
              </FormControl>

              {/* ✅ Manufacturer */}
              <FormControl isReadOnly>
                <FormLabel>Manufacturer</FormLabel>
                <Input
                  value={
                    manufacturers.find(
                      (m) =>
                        String(m.vehicleManufacturerCode) ===
                        String(selectedVehicle.manufacturerId)
                    )?.vehicleManufacturerName || "N/A"
                  }
                />
              </FormControl>

              {/* ✅ Model */}
              <FormControl isReadOnly>
                <FormLabel>Model</FormLabel>
                <Input value={selectedVehicle.model || ""} />
              </FormControl>

              {/* ✅ Vehicle Description */}
              <FormControl isReadOnly>
                <FormLabel>Vehicle Description</FormLabel>
                <Input value={selectedVehicle.vehicleDescription || ""} />
              </FormControl>

              {/* ✅ Date of Manufacturing */}
              <FormControl isReadOnly>
                <FormLabel>Date of Manufacturing</FormLabel>
                <Input
                  value={formatDate(selectedVehicle.dateOfManufacturing)}
                />
              </FormControl>

              {/* ✅ Registration Number */}
              <FormControl isReadOnly>
                <FormLabel>Registration No</FormLabel>
                <Input value={selectedVehicle.registrationNo || ""} />
              </FormControl>

              {/* ✅ Chassis Number */}
              <FormControl isReadOnly>
                <FormLabel>Chassis No</FormLabel>
                <Input value={selectedVehicle.chassisNo || ""} />
              </FormControl>

              {/* ✅ Engine Number */}
              <FormControl isReadOnly>
                <FormLabel>Engine No</FormLabel>
                <Input value={selectedVehicle.engineNo || ""} />
              </FormControl>

              {/* ✅ Purchase Date */}
              <FormControl isReadOnly>
                <FormLabel>Purchase Date</FormLabel>
                <Input
                  value={formatDate(selectedVehicle.purchaseDate)} />
              </FormControl>

              {/* ✅ Purchase Cost */}
              <FormControl isReadOnly>
                <FormLabel>Purchase Cost</FormLabel>
                <Input value={selectedVehicle.purchaseCost || ""} />
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

                  <AlertDialog
              isOpen={isDiscardAlertOpen}
              leastDestructiveRef={cancelRef}
              onClose={() => setIsDiscardAlertOpen(false)}
            >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="bold">
                Confirm Discard
              </AlertDialogHeader>

              <AlertDialogBody>
                Are you sure you want to discard this vehicle? This action cannot be undone.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={() => setIsDiscardAlertOpen(false)}>
                  Cancel
                </Button>
                <Button colorScheme="red" onClick={handleDiscardConfirmed} ml={3}>
                  Yes, Discard
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>


       {/* Pagination */}
        <Flex justify="center" align="center" gap={4} mt={4}>
          <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} isDisabled={currentPage === 1}>
            Previous
          </Button>
          <Box>
            Page {currentPage} of {totalPages}
          </Box>
          <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} isDisabled={currentPage === totalPages}>
            Next
          </Button>
        </Flex>
      </Box>
    </Stack>
    </Flex>
  );
};

export default VehicleFleetPage;
