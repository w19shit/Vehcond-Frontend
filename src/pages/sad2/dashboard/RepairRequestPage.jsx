import { useEffect, useState } from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Spinner,
  Badge,
  Button,
  useToast,
  Input,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  RadioGroup,
  Radio,
  Stack,
  Text,
  Flex,
  Select,
  FormControl,
  FormLabel,
  Center,
  VStack,
  SimpleGrid,
  Divider,
} from "@chakra-ui/react";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MAX_FILE_SIZE_MB = 3;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const RepairRequestsPage = () => {
  const toast = useToast();

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  // UI states
  const [activeUploadId, setActiveUploadId] = useState(null);

  // Upload modal (single reusable)
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState(null); // 'approval' | 'work' | 'sanction'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalMethod, setApprovalMethod] = useState("upload");
  const [selectedFile, setSelectedFile] = useState(null);

  // View modal (details + uploaded files + problems placeholder)
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [problemsForView, setProblemsForView] = useState([]);


  // Confirmation modal (Send for Estimate)  <-- NEW STATES
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [requestToConfirm, setRequestToConfirm] = useState(null);

  // Filters / pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [requestsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  // Confirmation modal (Send Back to Department)
const [sendBackConfirmOpen, setSendBackConfirmOpen] = useState(false);
const [requestToSendBack, setRequestToSendBack] = useState(null);


  // fetch on mount
  useEffect(() => {
    fetchRepairRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch function - collects by status (your existing pattern)
  const fetchRepairRequests = async () => {
    try {
      setLoading(true);
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

      const allData = responses.flatMap((res) => res.data || []);

      const orderMap = {
        "Pending with SAD2": 1,
        "Pending with Transport": 2,
        "Repair Estimated": 3,
        "Approval Order Uploaded": 4,
        "Work Order Uploaded": 5,
        "Sanction Order Uploaded": 6,
        "Approved for Repair": 7,
      };

      const sorted = allData.sort((a, b) => (orderMap[a.status] || 99) - (orderMap[b.status] || 99));

      setRequests(sorted);
      setFilteredRequests(sorted);
      setCurrentPage(1);

      const uniqueDepts = [...new Set(sorted.map((r) => r.department?.departmentName).filter(Boolean))];
      setDepartments(uniqueDepts);
    } catch (err) {
      toast({
        title: "Error fetching requests",
        description: err?.response?.data?.message || err?.message || "Unknown error",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // filtering
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = requests.filter((r) => {
      const matchesDept = selectedDept ? r.department?.departmentName === selectedDept : true;
      const matchesSearch =
        (r.department?.departmentName || "").toLowerCase().includes(lowerSearch) ||
        (r.vehicle?.registrationNo || r.registrationNo || "").toLowerCase().includes(lowerSearch);
      return matchesDept && matchesSearch;
    });
    setFilteredRequests(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedDept, requests]);

  // send for estimate with confirmation
  // REPLACED: now opens confirmation modal and actual API call happens in confirmSendForEstimate
  const handleSendForEstimate = (req) => {
    setRequestToConfirm(req);
    setConfirmModalOpen(true);
  };

  const confirmSendForEstimate = async () => {
    if (!requestToConfirm) return;

    try {
      const token = localStorage.getItem("access_token");
      await axios.put(
        `${BACKEND_URL}/repairrequest/${requestToConfirm.id}/send-for-estimate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Sent to Transport for Estimate", status: "success" });

      // close modal & reset
      setConfirmModalOpen(false);
      setRequestToConfirm(null);

      fetchRepairRequests();
    } catch (err) {
      toast({
        title: "Error sending for estimate",
        description: err?.response?.data?.error || err?.message || "Failed",
        status: "error",
      });
    }
  };

  // Open confirmation modal
const handleSendBackClick = (req) => {
  setRequestToSendBack(req);
  setSendBackConfirmOpen(true);
};

// Confirm send back
const confirmSendBackToDepartment = async () => {
  if (!requestToSendBack) return;

  try {
    const token = localStorage.getItem("access_token");

    await axios.put(
      `${BACKEND_URL}/repairrequest/${requestToSendBack.id}/send-back-to-department`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast({
      title: "Vehicle sent back to department",
      status: "success",
    });

    setSendBackConfirmOpen(false);
    setRequestToSendBack(null);
    fetchRepairRequests();
  } catch (err) {
    toast({
      title: "Failed to send back",
      description: err?.response?.data?.error || err.message,
      status: "error",
    });
  }
};


  // open upload modal (uniform layout)
  const openUploadModal = (req, mode) => {
    setSelectedRequest(req);
    setUploadMode(mode);
    setApprovalMethod("upload");
    setSelectedFile(null);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedFile(null);
    setSelectedRequest(null);
  };

  // open view modal
const openViewModal = async (req) => {
  setSelectedRequest(req);
  setViewModalOpen(true);

  try {
    const token = localStorage.getItem("access_token");
    const res = await axios.get(`${BACKEND_URL}/repairrequest/${req.id}/problems`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setProblemsForView(res.data || []);
  } catch (e) {
    toast({
      title: "Error loading problem list",
      description: e?.response?.data?.error || e.message,
      status: "error",
    });
    setProblemsForView([]);
  }
};


  const closeViewModal = () => {
    setViewModalOpen(false);
    setSelectedRequest(null);
  };

  // file validation
  const validateFile = (file) => {
    if (!file) return false;

    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast({ title: "File too large", description: `Max ${MAX_FILE_SIZE_MB} MB`, status: "error" });
      return false;
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: "Only PDF allowed", status: "error" });
      return false;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const bytes = new Uint8Array(e.target.result);
        const signature = String.fromCharCode(...bytes.slice(0, 4));
        resolve(signature.startsWith("%PDF"));
      };
      reader.readAsArrayBuffer(file.slice(0, 4));
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const valid = await validateFile(file);
    if (valid) {
      setSelectedFile(file);
      toast({ title: "File validated", status: "success", duration: 1200 });
    } else {
      e.target.value = "";
      setSelectedFile(null);
    }
  };

  // unified upload submit
  const handleUploadSubmit = async () => {
    // if approval and e-proposal chosen
    if (uploadMode === "approval" && approvalMethod === "eproposal") {
      toast({ title: "e-Proposal coming soon", status: "info" });
      return;
    }

    // for work/sanction also support e-proposal (disabled in UI but safe)
    if (uploadMode !== "approval" && approvalMethod === "eproposal") {
      toast({ title: "e-Proposal coming soon", status: "info" });
      return;
    }

    if (!selectedFile) {
      toast({ title: "Please select a file", status: "warning" });
      return;
    }

    const id = selectedRequest?.id;
    if (!id) {
      toast({ title: "No request selected", status: "error" });
      return;
    }

    const endpointMap = {
      approval: "upload-approval",
      work: "upload-workorder",
      sanction: "upload-sanction",
    };

    const endpoint = endpointMap[uploadMode];
    if (!endpoint) {
      toast({ title: "Invalid upload mode", status: "error" });
      return;
    }

    // perform upload
    try {
      setActiveUploadId(id);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const token = localStorage.getItem("access_token");

      await axios.put(`${BACKEND_URL}/repairrequest/${id}/${endpoint}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast({ title: "Uploaded successfully", status: "success" });
      await fetchRepairRequests();
      closeUploadModal();
    } catch (err) {
      toast({
        title: "Upload failed",
        description: err?.response?.data?.error || err?.message || "Failed",
        status: "error",
      });
    } finally {
      setActiveUploadId(null);
    }
  };

  // small helper for badge color
  const getBadge = (s) => {
    const colors = {
      "Pending with SAD2": "yellow",
      "Pending with Transport": "gray",
      "Repair Estimated": "blue",
      "Approval Order Uploaded": "purple",
      "Work Order Uploaded": "teal",
      "Sanction Order Uploaded": "green",
      "Approved for Repair": "green",
    };
    return <Badge colorScheme={colors[s] || "gray"}>{s}</Badge>;
  };

  // pagination helpers
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage) || 1;
  const indexOfLast = currentPage * requestsPerPage;
  const pageData = filteredRequests.slice(indexOfLast - requestsPerPage, indexOfLast);

  if (loading)
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );

  return (
    <Flex direction="column" minH="83vh" bg="#f1f2f4" p={6} borderRadius="2xl">
      <Box mb={6} >
        <Heading size="lg">Repair Requests</Heading>
      </Box>

      {/* Filters (contrasted box) */}
      <Box bg="white" p={4} borderRadius="xl" mb={4} boxShadow="sm"  w="700px">
        <HStack spacing={4} align="center">
          <Select
            w="260px"
            borderRadius="xl"
            placeholder="Filter by Department"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
          >
            {departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>

          <Input
            w="360px"
            borderRadius="xl"
            placeholder="Search by Department / Reg No."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <Button
            onClick={() => {
              setSelectedDept("");
              setSearchTerm("");
            }}
          >
            Reset
          </Button>
        </HStack>
      </Box>

      {/* Table */}
      <Box bg="white" p={4} borderRadius="xl" shadow="md" overflow="auto">
        <Table size="sm" minW="1000px">
          <Thead bg="gray.50" position="sticky" top={0}>
            <Tr>
              <Th>#</Th>
              <Th>Department</Th>
              <Th>Reg. No</Th>
              <Th>Model</Th>
              <Th>Total Estimate (₹)</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>

          <Tbody>
            {pageData.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center">
                  No repair requests found.
                </Td>
              </Tr>
            ) : (
              pageData.map((r, idx) => (
                <Tr key={r.id}>
                  <Td>{(currentPage - 1) * requestsPerPage + idx + 1}</Td>
                  <Td>{r.department?.departmentName || "-"}</Td>
                  <Td>{r.vehicle?.registrationNo || r.registrationNo || "-"}</Td>
                  <Td>{r.vehicle?.model || r.model || "-"}</Td>
                  <Td>{r.estimateAmount ? `₹${r.estimateAmount}` : "-"}</Td>
                  <Td>{getBadge(r.status)}</Td>

                  {/* Actions - compact & on same row */}
                  <Td>
                    <HStack spacing={2} align="center">
                      {/* Send for Estimate */}
                      {r.status === "Pending with SAD2" && (
                        <Button size="xs" colorScheme="orange" onClick={() => handleSendForEstimate(r)}>
                          Send for Estimate
                        </Button>
                      )}

                      {/* Get Approval (opens upload modal) */}
                      {r.status === "Repair Estimated" && (
                        <Button size="xs" colorScheme="yellow" onClick={() => openUploadModal(r, "approval")}>
                          Get Approval
                        </Button>
                      )}

                      {/* If any uploaded file exists -> View Repair Details */}
                      {(r.approvalOrderFile || r.workOrderFile || r.sanctionOrderFile) ? (
                        <Button size="xs" colorScheme="blue" onClick={() => openViewModal(r)}>
                          View Repair Details
                        </Button>
                      ) : null}

                    {/* Send Back to Department (ONLY when Approved for Repair) */}
                     {r.status === "Approved for Repair" && (
                        <Button
                          size="xs"
                          colorScheme="green"
                          onClick={() => handleSendBackClick(r)}
                        >
                          Send Back to Department
                        </Button>
                      )}

                      {/* Upload Work Order (shown when approval exists but work missing) */}
                      {r.approvalOrderFile && !r.workOrderFile && (
                        <Button size="xs" colorScheme="purple" onClick={() => openUploadModal(r, "work")}>
                          Upload Work Order
                        </Button>
                      )}

                      {/* Upload Sanction (shown when work exists but sanction missing) */}
                      {r.workOrderFile && !r.sanctionOrderFile && (
                        <Button size="xs" colorScheme="teal" onClick={() => openUploadModal(r, "sanction")}>
                          Upload Sanction
                        </Button>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* Pagination */}
        <Flex justify="center" align="center" gap={4} mt={4}>
          <Button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} isDisabled={currentPage === 1}>
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Box>

      {/* =======================================================
          CONFIRM SEND BACK TO DEPARTMENT MODAL
        ======================================================= */}
      <Modal
        isOpen={sendBackConfirmOpen}
        onClose={() => setSendBackConfirmOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontSize="md">
              Are you sure you want to send this vehicle back to the department?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="green"
              onClick={confirmSendBackToDepartment}
            >
              Yes, Send Back
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* =======================================================
          UNIFORM UPLOAD MODAL (approval | work | sanction)
         ======================================================= */}
      <Modal isOpen={uploadModalOpen} onClose={closeUploadModal} isCentered>
        <ModalOverlay />
        <ModalContent
          // small open/close animation via CSS transition
          style={{
            transition: "transform 180ms ease, opacity 180ms ease",
          }}
        >
          <ModalHeader>
            {uploadMode === "approval"
              ? "Approval — Upload"
              : uploadMode === "work"
              ? "Work Order — Upload"
              : "Sanction Order — Upload"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="stretch" spacing={4}>
              {/* Show vehicle summary */}
              <Box p={3} borderRadius="md" bg="gray.50">
                <SimpleGrid columns={2} spacing={2}>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      <b>Reg. No:</b> {selectedRequest?.vehicle?.registrationNo || selectedRequest?.registrationNo || "-"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <b>Model:</b> {selectedRequest?.vehicle?.model || selectedRequest?.model || "-"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600">
                      <b>Department:</b> {selectedRequest?.department?.departmentName || "-"}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      <b>Total Estimate:</b> {selectedRequest?.estimateAmount ? `₹${selectedRequest.estimateAmount}` : "-"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>

              {/* Upload options stacked (Upload file first, e-proposal second) */}
              <RadioGroup value={approvalMethod} onChange={(v) => setApprovalMethod(v)}>
                <Stack spacing={3}>
                  <Radio value="upload">Upload {uploadMode === "approval" ? "approved order" : uploadMode === "work" ? "work order" : "sanction order"}</Radio>
                  <Radio value="eproposal" isDisabled>
                    Get via e-Proposal (coming soon)
                  </Radio>
                </Stack>
              </RadioGroup>

              {approvalMethod === "upload" && (
                <FormControl isRequired>
                  <FormLabel>Choose PDF file</FormLabel>
                  <Input type="file" accept=".pdf" onChange={handleFileSelect} />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Max {MAX_FILE_SIZE_MB} MB. Only valid PDF files accepted.
                  </Text>
                </FormControl>
              )}
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" onClick={closeUploadModal} mr={2}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleUploadSubmit} isLoading={activeUploadId !== null}>
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* =======================================================
          VIEW REPAIR DETAILS MODAL
         ======================================================= */}
      <Modal isOpen={viewModalOpen} onClose={closeViewModal} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent style={{ transition: "transform 180ms ease, opacity 180ms ease" }}>
          <ModalHeader>Repair Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Vehicle / Request header */}
            <Box mb={3} p={3} bg="gray.50" borderRadius="md">
              <SimpleGrid columns={2} spacing={2}>
                <Box>
                  <Text fontSize="sm"><b>Reg. No:</b> {selectedRequest?.vehicle?.registrationNo || selectedRequest?.registrationNo || "-"}</Text>
                  <Text fontSize="sm"><b>Model:</b> {selectedRequest?.vehicle?.model || selectedRequest?.model || "-"}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm"><b>Department:</b> {selectedRequest?.department?.departmentName || "-"}</Text>
                  <Text fontSize="sm"><b>Total Estimate:</b> {selectedRequest?.estimateAmount ? `₹${selectedRequest.estimateAmount}` : "-"}</Text>
                </Box>
              </SimpleGrid>
            </Box>

            <Divider mb={3} />

            {/* PROBLEM LIST PLACEHOLDER (Option D) */}
              <Box mb={4}>
                <Text fontSize="md" fontWeight="semibold" mb={2}>Problem List</Text>
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
                              No problems found.
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

            <Divider mb={3} />

            {/* Uploaded files (ONLY if present) */}
            <Box>
              <Text fontSize="md" fontWeight="semibold" mb={2}>Uploaded files</Text>

              {!selectedRequest?.approvalOrderFile && !selectedRequest?.workOrderFile && !selectedRequest?.sanctionOrderFile ? (
                <Text color="gray.600" fontSize="sm">No files uploaded yet.</Text>
              ) : (
                <VStack align="stretch" spacing={3}>
                  {selectedRequest?.approvalOrderFile && (
                    <Button
                      size="sm"
                      w="100%"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedRequest.approvalOrderFile}`, "_blank")}
                    >
                      View Approval Order
                    </Button>
                  )}

                  {selectedRequest?.workOrderFile && (
                    <Button
                      size="sm"
                      w="100%"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedRequest.workOrderFile}`, "_blank")}
                    >
                      View Work Order
                    </Button>
                  )}

                  {selectedRequest?.sanctionOrderFile && (
                    <Button
                      size="sm"
                      w="100%"
                      onClick={() => window.open(`${BACKEND_URL}/uploads/${selectedRequest.sanctionOrderFile}`, "_blank")}
                    >
                      View Sanction Order
                    </Button>
                  )}
                </VStack>
              )}
            </Box>
          </ModalBody>

          <ModalFooter>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Modal for Send For Estimate (ADDED) */}
      <Modal isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent borderRadius="lg">
          <ModalHeader>Confirm Action</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Text fontSize="md">
              Are you sure you want to send the vehicle to Transport Department for estimate?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={() => setConfirmModalOpen(false)}>
              Cancel
            </Button>

            <Button colorScheme="orange" onClick={confirmSendForEstimate}>
              Yes, Send
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default RepairRequestsPage;
