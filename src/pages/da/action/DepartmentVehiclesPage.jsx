import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Heading,
  useToast,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  HStack,
  Badge,
  Flex,
  Text,
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const DepartmentVehiclesPage = () => {
  const [vehicles, setVehicles] = useState([]);
  const [manufacturers, setManufacturers] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [isRepairModalOpen, setIsRepairModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [problemsForView, setProblemsForView] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // List of repair requests fetched by status (used to map vehicle -> repairRequestId)
  const [repairRequests, setRepairRequests] = useState([]);
   const rowsPerPage = 10;

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const totalPages = Math.ceil(filteredVehicles.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentVehicles = filteredVehicles.slice(indexOfFirstRow, indexOfLastRow);

  const [form, setForm] = useState({
    kilometerReading: "",
    day: "",
    month: "",
    year: "",
    location: "",
    urgency: "",
    problems: [""], // MULTIPLE PROBLEMS
  });

  // ------------------------------------------------------------
useEffect(() => {
  fetchManufacturers();
  fetchVehicles();
  fetchRepairRequestsByStatuses();
}, []);

useEffect(() => {
  filterData();
}, [searchTerm, vehicles]);

// Status priority (lower = higher on table)
const STATUS_ORDER = {
  "Pending with SAD2": 1,
  "Pending with Transport": 2,
  "Repair Estimated": 3,
  "Approval Order Uploaded": 4,
  "Work Order Uploaded": 5,
  "Sanction Order Uploaded": 6,
  "Approved for Repair": 7,
  "Running": 99, // 👈 always LAST
};


//  Filtering
// Filtering + Status Sorting
const filterData = () => {
  const lower = searchTerm.toLowerCase().trim();

  let filtered = vehicles;

  // 🔍 Search filter
  if (lower) {
    filtered = vehicles.filter((v) => {
      return (
        (v.registrationNo ?? "").toLowerCase().includes(lower) ||
        (v.model ?? "").toLowerCase().includes(lower) ||
        (v.manufacturerName ?? "").toLowerCase().includes(lower) ||
        (v.repairStatus ?? "").toLowerCase().includes(lower)
      );
    });
  }

  // 🔃 Sort by status (Running last)
  const sorted = [...filtered].sort((a, b) => {
    const orderA = STATUS_ORDER[a.repairStatus] ?? 50;
    const orderB = STATUS_ORDER[b.repairStatus] ?? 50;
    return orderA - orderB;
  });

  setFilteredVehicles(sorted);
  setCurrentPage(1);
};



  // ------------------------------------------------------------
  const fetchManufacturers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/vehicle-manufacturer`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });

      const normalized = res.data.map((m) => ({
        vehicleManufacturerCode:
          m.vehicleManufacturerCode ?? m.vehiclemanufacturercode ?? m.manufacturerCode,
        vehicleManufacturerName:
          m.vehicleManufacturerName ?? m.vehiclemanufacturername ?? m.manufacturerName,
      }));

      setManufacturers(normalized);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
    }
  };

  // ------------------------------------------------------------
  const fetchRepairRequestsByStatuses = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const statuses = [
        "Pending with SAD2",
        "Pending with Transport",
        "Repair Estimated",
        "Approval Order Uploaded",
        "Work Order Uploaded",
        "Sanction Order Uploaded",
        "Approved for Repair",
      ];

      const responses = await Promise.all(
        statuses.map((s) =>
          axios.get(`${BACKEND_URL}/repairrequest/status/${encodeURIComponent(s)}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        )
      );

      const all = responses.flatMap((r) => r.data || []);
      // keep them as-is; we'll search among them to find the request for a vehicle
      setRepairRequests(all);
    } catch (err) {
      console.error("Error fetching repair requests by status:", err);
      // not fatal for page; show toast but continue
      toast({
        title: "Warning",
        description: "Could not fetch repair request list (used for problem lookup).",
        status: "warning",
        duration: 4000,
      });
    }
  };

  // ------------------------------------------------------------
  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");

      const resVehicles = await axios.get(`${BACKEND_URL}/poolparked/my-department`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const resStatus = await axios.get(`${BACKEND_URL}/repairrequest/latest-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const statusMap = resStatus.data || {};

      const normalized = resVehicles.data.map((v) => ({
        ...v,
        manufacturerId:
          v.manufacturerId ?? v.vehicleManufacturerCode ?? v.manufacturer?.vehicleManufacturerCode ?? null,
        manufacturerName:
          v.manufacturer?.vehicleManufacturerName ?? v.vehicleManufacturerName ?? null,
        allotDate: v.allotDate ?? v.allot_date ?? v.allottedDate ?? null,
        repairStatus: statusMap[v.id]?.status ?? "Running",
        // these are pulled from latest-status map (unchanged)
        estimateAmount: statusMap[v.id]?.estimateAmount || null,
        remarks: statusMap[v.id]?.remarks || null,
        approvalFile: statusMap[v.id]?.approvalOrderFile || null,
        workFile: statusMap[v.id]?.workOrderFile || null,
        sanctionFile: statusMap[v.id]?.sanctionOrderFile || null,
        // try to include repairRequestId if backend provides it in latest-status map
        repairRequestId: statusMap[v.id]?.repairRequestId ?? null,
        // keep department object if present (some responses include department)
        department: v.department ?? v.dept ?? null,
      }));

      setVehicles(normalized);
    } catch (err) {
      console.error("Error loading vehicles:", err);
      toast({ title: "Error loading vehicles", status: "error" });
    } finally {
      setLoading(false);
    }
  };


  // ------------------------------------------------------------
  // MULTIPLE PROBLEM FUNCTIONS
  // ------------------------------------------------------------

  const addProblem = () => {
    setForm({ ...form, problems: [...form.problems, ""] });
  };

  const updateProblem = (index, value) => {
    const updated = [...form.problems];
    updated[index] = value;
    setForm({ ...form, problems: updated });
  };

  const removeProblem = (index) => {
    const updated = [...form.problems];
    updated.splice(index, 1);
    setForm({ ...form, problems: updated });
  };

  // ------------------------------------------------------------

  const openRepairModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setIsRepairModalOpen(true);
  };

  const closeRepairModal = () => {
    setIsRepairModalOpen(false);
    setForm({
      kilometerReading: "",
      day: "",
      month: "",
      year: "",
      location: "",
      urgency: "",
      problems: [""], // RESET
    });
  };

  const handleSendForRepair = async () => {
    const lastServiceDate = `${form.year}-${form.month?.toString().padStart(2, "0") ?? "00"}-${form.day
      ?.toString()
      .padStart(2, "0") ?? "00"}`;

    try {
      await axios.post(
        `${BACKEND_URL}/repairrequest/add`,
        {
          vehicleId: selectedVehicle.id,
          departmentId: selectedVehicle.departmentId,
          kilometerReading: form.kilometerReading,
          lastServiceDate,
          location: form.location,
          urgency: form.urgency,
          problems: form.problems, // ⬅ SEND MULTIPLE PROBLEMS
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        }
      );

      toast({
        title: "Sent for Repair",
        description: "Repair request sent to SAD2 successfully.",
        status: "success",
      });
      closeRepairModal();
      // refresh both lists
      fetchVehicles();
      fetchRepairRequestsByStatuses();
    } catch (err) {
      toast({
        title: "Error sending for repair",
        description: err.response?.data?.message || err.message,
        status: "error",
      });
    }
  };

  // ------------------------------------------------------------
  // VIEW MODAL (find repairRequestId from repairRequests list then fetch problems)
  // ------------------------------------------------------------
const openViewModal = async (vehicle) => {
  setSelectedData(vehicle);
  setIsViewModalOpen(true);
  setProblemsForView([]);

  try {
    const token = localStorage.getItem("access_token");

    // -------------------------
    // 1) FIND THE REPAIR REQUEST
    // -------------------------

    let requestId = vehicle.repairRequestId ?? null;

    // If not already set in vehicle → search in loaded repairRequests
    if (!requestId) {
      const found = repairRequests.find(
        (r) =>
          (r.vehicle && (r.vehicle.id === vehicle.id || r.vehicleId === vehicle.id)) ||
          r.vehicleId === vehicle.id
      );
      if (found) requestId = found.id;
    }

    // If still not found → fallback search by statuses
    if (!requestId) {
      const statuses = [
        "Pending with SAD2",
        "Pending with Transport",
        "Repair Estimated",
        "Approval Order Uploaded",
        "Work Order Uploaded",
        "Sanction Order Uploaded",
        "Approved for Repair",
      ];

      for (const s of statuses) {
        try {
          const res = await axios.get(
            `${BACKEND_URL}/repairrequest/status/${encodeURIComponent(s)}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const list = res.data || [];
          const found = list.find(
            (r) =>
              (r.vehicle && (r.vehicle.id === vehicle.id || r.vehicleId === vehicle.id)) ||
              r.vehicleId === vehicle.id
          );

          if (found) {
            requestId = found.id;

            // update local list
            setRepairRequests((prev) => {
              if (!prev.find((p) => p.id === found.id)) return [...prev, ...list];
              return prev;
            });

            break;
          }
        } catch {}
      }
    }

    if (!requestId) {
      toast({
        title: "No repair request found",
        description: "Unable to load details for this vehicle.",
        status: "warning",
      });
      return;
    }

    // ------------------------------
    // 2) GET PROBLEMS FOR THIS REQUEST
    // ------------------------------

    const resProblems = await axios.get(
      `${BACKEND_URL}/repairrequest/${requestId}/problems`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const problems = resProblems.data || [];
    setProblemsForView(problems);

    // ------------------------------
    // 3) COMPUTE TOTAL ESTIMATE
    // ------------------------------

    const totalEstimate = problems.reduce(
      (sum, p) => sum + (p.estimateAmount || 0),
      0
    );

    // Store into selectedData for modal display
    setSelectedData((prev) => ({
      ...prev,
      totalEstimate,
    }));
  } catch (err) {
    toast({
      title: "Error loading repair details",
      description: err?.response?.data?.error || err.message,
      status: "error",
    });
  }
};


  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedData(null);
    setProblemsForView([]);
  };

  // ------------------------------------------------------------
  // HELPERS
  // ------------------------------------------------------------

  const getManufacturerName = (v) => {
    const manufacturer = manufacturers.find((m) => m.vehicleManufacturerCode === v.manufacturerId);
    return manufacturer?.vehicleManufacturerName || v.manufacturerName || "N/A";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
  };

  const getStatusBadge = (status) => {
    const s = status?.trim() || "Running";
    const colors = {
      Running: "green",
      "Pending with SAD2": "yellow",
      "Pending with Transport": "orange",
      "Repair Estimated": "purple",
      "Approval Order Uploaded": "blue",
      "Work Order Uploaded": "cyan",
      "Sanction Order Uploaded": "teal",
      "Approved for Repair": "green",
    };
    return (
      <Badge colorScheme={colors[s] || "gray"} px={2} py={1} borderRadius="md">
        {s}
      </Badge>
    );
  };

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------

  if (loading)
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner size="xl" />
        <Text ml={3}>Loading vehicles...</Text>
      </Flex>
    );
    
    const handleReset = () => {
    setSearchTerm("");
    setFilteredVehicles(vehicles);
    setCurrentPage(1);
  };

  return (
    <Flex direction="column" minH="80vh" bg="#f1f2f4" borderRadius="2xl">
      <Box flex="1" p={{ base: 4, md: 8 }}>
        <Heading size="lg" mb={6}>
          Department Vehicles
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
            <Table minW="1100px" variant="simple" size="sm">
              <Thead bg="gray.100" position="sticky" top={0}>
                <Tr>
                  <Th>#</Th>
                  <Th>Registration No</Th>
                  <Th>Model</Th>
                  <Th>Manufacturer</Th>
                  <Th>Allot Date</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {currentVehicles.length === 0 ? (
                  <Tr>
                    <Td colSpan={7} textAlign="center">
                      No vehicles found.
                    </Td>
                  </Tr>
                ) : (
                  currentVehicles.map((v, i) => (
                    <Tr key={v.id}>
                      <Td>{indexOfFirstRow + i + 1}</Td>
                      <Td>{v.registrationNo}</Td>
                      <Td>{v.model}</Td>
                      <Td>{getManufacturerName(v)}</Td>
                      <Td>{formatDate(v.allotDate)}</Td>
                      <Td>{getStatusBadge(v.repairStatus)}</Td>
                      <Td>
                        {v.repairStatus === "Running" ? (
                          <Button size="sm" colorScheme="blue" onClick={() => openRepairModal(v)}>
                            Send for Repair
                          </Button>
                        ) : (
                          <Button size="sm" colorScheme="purple" onClick={() => openViewModal(v)}>
                            View
                          </Button>
                        )}
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

      {/* ------------------ SEND FOR REPAIR MODAL ------------------ */}
      <Modal isOpen={isRepairModalOpen} onClose={closeRepairModal} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Send Vehicle for Repair</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3} isRequired>
              <FormLabel>Current Kilometer Reading</FormLabel>
              <Input
                type="number"
                value={form.kilometerReading}
                onChange={(e) => setForm({ ...form, kilometerReading: e.target.value })}
                placeholder="Enter current KM reading"
              />
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Date of Last Service</FormLabel>
              <HStack>
                <Select placeholder="Day" value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value })}>
                  {Array.from({ length: 31 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Select>

                <Select placeholder="Month" value={form.month} onChange={(e) => setForm({ ...form, month: e.target.value })}>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Select>

                <Select placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i} value={new Date().getFullYear() - i}>
                      {new Date().getFullYear() - i}
                    </option>
                  ))}
                </Select>
              </HStack>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Location</FormLabel>
              <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Enter location" />
            </FormControl>

            {/* MULTIPLE PROBLEMS */}
            <FormControl mb={3}>
              <FormLabel>Nature of Problems</FormLabel>

              {form.problems.map((p, index) => (
                <HStack key={index} mb={2} align="start">
                  <Textarea value={p} placeholder={`Problem ${index + 1}`} onChange={(e) => updateProblem(index, e.target.value)} resize="vertical" />

                  {form.problems.length > 1 && (
                    <Button colorScheme="red" size="sm" onClick={() => removeProblem(index)}>
                      -
                    </Button>
                  )}
                </HStack>
              ))}

              <Button size="sm" colorScheme="green" onClick={addProblem}>
                + Add Problem
              </Button>
            </FormControl>

            <FormControl mb={3}>
              <FormLabel>Urgency / Priority</FormLabel>
              <Select placeholder="Select urgency" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                <option value="Routine">Routine</option>
                <option value="Urgent">Urgent</option>
              </Select>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSendForRepair}>
              Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* ------------------ VIEW REPAIR STATUS MODAL (FULL DETAILS) ------------------ */}
      <Modal isOpen={isViewModalOpen} onClose={closeViewModal} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent style={{ transition: "transform 180ms ease, opacity 180ms ease" }}>
          <ModalHeader>Vehicle Details</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {/* Vehicle / Basic Info */}
            <Box mb={3} p={3} bg="gray.50" borderRadius="md">
              <Text>
                <b>Registration No:</b> {selectedData?.registrationNo}
              </Text>
              <Text>
                <b>Model:</b> {selectedData?.model}
              </Text>
              <Text>
                <b>Status:</b> {selectedData?.repairStatus}
              </Text>
              <Text>
                <b>Total Estimate:</b> {selectedData?.totalEstimate ? ` ₹${selectedData.totalEstimate}` : " -"}
              </Text>
            </Box>

            {/* Problem List */}
            <Box mb={4}>
              <Text fontSize="md" fontWeight="semibold" mb={2}>
                Problem List
              </Text>
              <Box borderRadius="md" overflow="auto" bg="white" boxShadow="sm">
                <Table size="sm">
                  <Thead bg="gray.50">
                    <Tr>
                      <Th>Problem</Th>
                      <Th>Remarks</Th>
                      <Th>Estimate (₹)</Th>
                    </Tr>
                  </Thead>

                  <Tbody>
                    {problemsForView.length === 0 ? (
                      <Tr>
                        <Td colSpan={3} textAlign="center" color="gray.500">
                          No problem details available.
                        </Td>
                      </Tr>
                    ) : (
                      problemsForView.map((p) => (
                        <Tr key={p.id}>
                          <Td>{p.problemText || "-"}</Td>
                          <Td>{p.remark || "-"}</Td>
                          <Td>{p.estimateAmount != null ? `₹${p.estimateAmount}` : "-"}</Td>
                        </Tr>
                      ))
                    )}
                  </Tbody>
                </Table>
              </Box>
            </Box>

            {/* Uploaded Files Section */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={2}>
                Uploaded Files
              </Text>

              {!selectedData?.approvalFile && !selectedData?.workFile && !selectedData?.sanctionFile ? (
                <Text color="gray.600" fontSize="sm">
                  No files uploaded yet.
                </Text>
              ) : (
                <Flex direction="column" gap={3}>
                  {selectedData?.approvalFile && (
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedData.approvalFile}`, "_blank")}
                    >
                      View Approval Order
                    </Button>
                  )}

                  {selectedData?.workFile && (
                    <Button
                      size="sm"
                      colorScheme="cyan"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedData.workFile}`, "_blank")}
                    >
                      View Work Order
                    </Button>
                  )}

                  {selectedData?.sanctionFile && (
                    <Button
                      size="sm"
                      colorScheme="teal"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedData.sanctionFile}`, "_blank")}
                    >
                      View Sanction Order
                    </Button>
                  )}
                </Flex>
              )}
            </Box>
          </ModalBody>
          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default DepartmentVehiclesPage;
