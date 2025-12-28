import React, { useState, useRef, useMemo } from "react";
import {
  Box,
  Heading,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
  Flex,
  Text,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Input,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Center,
  SimpleGrid,
  HStack,
  Divider,
  Select,
} from "@chakra-ui/react";
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";

/* ================= API HELPERS ================= */

const fetchPendingRequests = async () => {
  const status = "Pending with Transport";
  const { data } = await axios.get(
    `${BACKEND_URL}/repairrequest/status/${encodeURIComponent(status)}`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};

const fetchProblemsForRequest = async (requestId) => {
  const { data } = await axios.get(
    `${BACKEND_URL}/repairrequest/${requestId}/problems`,
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};

const submitAllEstimates = async ({ requestId, problems }) => {
  const { data } = await axios.put(
    `${BACKEND_URL}/repairrequest/${requestId}/estimate`,
    { problems },
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};

const sendEstimateToSAD2 = async (id) => {
  const { data } = await axios.put(
    `${BACKEND_URL}/repairrequest/${id}/send-to-sad2`,
    {},
    { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
  );
  return data;
};

/* ================= COMPONENT ================= */

const PendingRepairRequestsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const cancelRef = useRef();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestSummary, setSelectedRequestSummary] = useState(null);
  const [problems, setProblems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  /* ================= FETCH ================= */

  const {
    data: requests = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["pendingRepairRequests"],
    queryFn: fetchPendingRequests,
    staleTime: 30 * 1000,
  });

  /* ================= FILTER ================= */

  const filteredRequests = useMemo(() => {
    const lower = searchTerm.toLowerCase().trim();
    if (!lower) return requests;

    return requests.filter(
      (r) =>
        (r.vehicle?.registrationNo || "").toLowerCase().includes(lower) ||
        (r.department?.departmentName || "").toLowerCase().includes(lower)
    );
  }, [requests, searchTerm]);

  /* ================= PAGINATION ================= */

  const totalPages = Math.ceil(filteredRequests.length / rowsPerPage) || 1;
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const pageData = filteredRequests.slice(indexOfFirst, indexOfLast);

  /* ================= MUTATIONS ================= */

  const estimateAllMutation = useMutation({
    mutationFn: submitAllEstimates,
    onSuccess: () => {
      toast({ title: "Estimates submitted", status: "success" });
      queryClient.invalidateQueries(["pendingRepairRequests"]);
      setConfirmOpen(false);
      closeModal();
    },
    onError: (err) =>
      toast({
        title: "Submit failed",
        description: err?.response?.data?.error || err?.message,
        status: "error",
      }),
  });

  const sendMutation = useMutation({
    mutationFn: sendEstimateToSAD2,
    onSuccess: () => {
      toast({ title: "Sent to SAD2", status: "info" });
      queryClient.invalidateQueries(["pendingRepairRequests"]);
    },
  });

  /* ================= HELPERS ================= */

  const openModal = async (id, summary) => {
    setSelectedRequestId(id);
    setSelectedRequestSummary(summary);
    const data = await fetchProblemsForRequest(id);
    setProblems(
      data.map((p) => ({
        id: p.id,
        problemText: p.problemText ?? p.problem ?? "",
        estimateAmount: p.estimateAmount ? String(p.estimateAmount) : "",
        remark: p.remark ?? "",
      }))
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRequestId(null);
    setProblems([]);
    setSelectedRequestSummary(null);
  };

  const totalEstimate = useMemo(
    () =>
      problems.reduce(
        (sum, p) => sum + (parseFloat(p.estimateAmount) || 0),
        0
      ),
    [problems]
  );

  const handlePrepareSubmit = () => {
    for (let p of problems) {
      if (!p.estimateAmount || Number(p.estimateAmount) <= 0) {
        toast({
          title: "Invalid estimate",
          description: `Enter valid amount for "${p.problemText}"`,
          status: "warning",
        });
        return;
      }
    }
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = () => {
    estimateAllMutation.mutate({
      requestId: selectedRequestId,
      problems: problems.map((p) => ({
        id: p.id,
        estimateAmount: Number(p.estimateAmount),
        remark: p.remark,
      })),
    });
  };

  /* ================= UI ================= */

  if (isLoading)
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );

  if (isError) return <Text color="red.500">{error?.message}</Text>;

  return (
    <Flex direction="column" minH="83vh" bg="#f1f2f4" p={6} borderRadius="2xl">
      <Heading mb={4}>Pending Repair Requests</Heading>

      {/* SEARCH */}
      <Box
          bg="white"
          p={3}
          borderRadius="xl"
          mb={4}
          boxShadow="sm"
          w="500px"
        >
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

      {/* TABLE */}
      <Box bg="white" p={4} borderRadius="xl">
        <Table size="sm">
          <Thead bg="gray.50">
            <Tr>
              <Th>#</Th>
              <Th>Department</Th>
              <Th>Reg No</Th>
              <Th>Urgency</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>

          <Tbody>
            {pageData.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center">
                  No pending requests
                </Td>
              </Tr>
            ) : (
              pageData.map((r, i) => (
                <Tr key={r.id}>
                  <Td>{indexOfFirst + i + 1}</Td>
                  <Td>{r.department?.departmentName}</Td>
                  <Td>{r.vehicle?.registrationNo}</Td>
                  <Td>{r.urgency}</Td>
                  <Td>
                    <Badge colorScheme="yellow">{r.status}</Badge>
                  </Td>
                  <Td>
                    <Button size="sm" onClick={() => openModal(r.id, r)}>
                      Make Estimate
                    </Button>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>

        {/* PAGINATION */}
        <Flex justify="center" mt={4} gap={4}>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            isDisabled={currentPage === 1}
          >
            Previous
          </Button>
          <Text>
            Page {currentPage} of {totalPages}
          </Text>
          <Button
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            isDisabled={currentPage === totalPages}
          >
            Next
          </Button>
        </Flex>
      </Box>

      {/* ESTIMATE MODAL */}
            <Modal isOpen={isModalOpen} onClose={closeModal} size="xl" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Make Estimate</ModalHeader>
          <ModalCloseButton />
            <ModalBody>
              {/* ===== VEHICLE & REQUEST DETAILS ===== */}
              <Box mb={4}>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <SimpleGrid columns={[1, 2]} spacing={3}>
                    <Box>
                      <Text fontSize="sm">
                        <b>Department:</b>{" "}
                        {selectedRequestSummary?.department?.departmentName || "-"}
                      </Text>
                      <Text fontSize="sm">
                        <b>Vehicle Reg No:</b>{" "}
                        {selectedRequestSummary?.vehicle?.registrationNo || "-"}
                      </Text>
                      <Text fontSize="sm">
                        <b>Model:</b>{" "}
                        {selectedRequestSummary?.vehicle?.model || "-"}
                      </Text>
                    </Box>

                    <Box>
                      <Text fontSize="sm">
                        <b>Kilometer Reading:</b>{" "}
                        {selectedRequestSummary?.kilometerReading ?? "-"}
                      </Text>
                      <Text fontSize="sm">
                        <b>Last Service Date:</b>{" "}
                        {selectedRequestSummary?.lastServiceDate
                          ? new Date(
                              selectedRequestSummary.lastServiceDate
                            ).toLocaleDateString()
                          : "-"}
                      </Text>
                      <Text fontSize="sm">
                        <b>Urgency:</b> {selectedRequestSummary?.urgency || "-"}
                      </Text>
                      <Text fontSize="sm">
                        <b>Location:</b> {selectedRequestSummary?.location || "-"}
                      </Text>
                    </Box>
                  </SimpleGrid>
                </Box>
              </Box>

              <Divider mb={4} />

              {/* ===== PROBLEMS TABLE ===== */}
              <Table size="sm">
                <Thead>
                  <Tr>
                    <Th>Problem</Th>
                    <Th>Estimate</Th>
                    <Th>Remark</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {problems.length === 0 ? (
                    <Tr>
                      <Td colSpan={3} textAlign="center">
                        <Text color="gray.500">No problems found</Text>
                      </Td>
                    </Tr>
                  ) : (
                    problems.map((p, i) => (
                      <Tr key={p.id}>
                        <Td whiteSpace="normal">{p.problemText}</Td>
                        <Td>
                          <Input
                            type="number"
                            min={0}
                            value={p.estimateAmount}
                            onChange={(e) => {
                              const copy = [...problems];
                              copy[i].estimateAmount = e.target.value;
                              setProblems(copy);
                            }}
                          />
                        </Td>
                        <Td>
                          <Input
                            value={p.remark}
                            onChange={(e) => {
                              const copy = [...problems];
                              copy[i].remark = e.target.value;
                              setProblems(copy);
                            }}
                          />
                        </Td>
                      </Tr>
                    ))
                  )}
                </Tbody>
              </Table>

              {/* ===== TOTAL ===== */}
              <Text mt={3} textAlign="right" fontWeight="semibold">
                Total Estimate: ₹{totalEstimate}
              </Text>
            </ModalBody>

            <ModalFooter>
              <Button colorScheme="blue" onClick={handlePrepareSubmit}>
                Submit
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      {/* CONFIRM */}
      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={cancelRef} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Confirm</AlertDialogHeader>
            <AlertDialogBody>Are you sure you want to submit the estimates for all listed repair problems?</AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button ml={3} colorScheme="blue" onClick={handleConfirmSubmit}>
                Yes
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default PendingRepairRequestsPage;
