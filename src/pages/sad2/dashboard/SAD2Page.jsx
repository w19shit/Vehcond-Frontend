import React, { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Grid,
  Heading,
  Text,
  IconButton,
  HStack,
  VStack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react";

import { SunIcon, MoonIcon, HamburgerIcon } from "@chakra-ui/icons";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import axios from "axios";
import { motion } from "framer-motion";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const MotionBox = motion(Box);

export default function SAD2Page() {
  const { colorMode, toggleColorMode } = useColorMode();
  const cardBg = useColorModeValue("#ffffff", "#1f1f1f");
  const subBg = useColorModeValue("#f5f6f7", "#2a2a2a");
  const subtle = useColorModeValue("gray.600", "gray.400");

  const [repairStats, setRepairStats] = useState([]);
  const [progressData, setProgressData] = useState({
    completed: 0,
    inProgress: 0,
  });

  const [counts, setCounts] = useState({
    total: 0,
    unallotted: 0,
    allotted: 0,
    pendingRepair: 0,
  });

  const [reminders, setReminders] = useState([]);

  // ======================= VEHICLE COUNTS ==========================
  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      const allRes = await axios.get(`${BACKEND_URL}/poolparked/all`, auth);
      const vehicles = allRes.data;

      const unallotted = vehicles.filter((v) => v.processCode === 17);
      const allotted = vehicles.filter((v) => v.processCode >= 18);

      const pendingRepairRes = await axios.get(
        `${BACKEND_URL}/repairrequest/status/Pending with SAD2`,
        auth
      );

      setCounts({
        total: vehicles.length,
        unallotted: unallotted.length,
        allotted: allotted.length,
        pendingRepair: pendingRepairRes.data.length,
      });
    } catch (err) {
      console.error("Count fetch error:", err);
    }
  };

  // ======================= REPAIR ANALYTICS ==========================
  const fetchRepairAnalytics = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      const statuses = [
        "Pending with SAD2",
        "Pending with Transport",
        "Repair Estimated",
        "Approval Order Uploaded",
        "Work Order Uploaded",
        "Sanction Order Uploaded",
        "Approved for Repair",
      ];

      const results = await Promise.all(
        statuses.map((status) =>
          axios
            .get(`${BACKEND_URL}/repairrequest/status/${encodeURIComponent(status)}`, auth)
            .then((res) => ({ status, count: res.data.length }))
            .catch(() => ({ status, count: 0 }))
        )
      );

      setRepairStats(results);

      const totalRepairs = results.reduce((a, s) => a + s.count, 0);
      const completed = results.find((s) => s.status === "Approved for Repair")?.count || 0;
      const inProgress = totalRepairs - completed;

      setProgressData({
        completed: totalRepairs === 0 ? 0 : Math.round((completed / totalRepairs) * 100),
        inProgress: totalRepairs === 0 ? 0 : Math.round((inProgress / totalRepairs) * 100),
      });
    } catch (err) {
      console.error("Repair analytics error:", err);
    }
  };

  // ======================= REMINDERS ==========================
  const buildReminders = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const auth = { headers: { Authorization: `Bearer ${token}` } };

      const statuses = ["Repair Estimated", "Approval Order Uploaded", "Work Order Uploaded"];

      const results = await Promise.all(
        statuses.map((s) =>
          axios
            .get(`${BACKEND_URL}/repairrequest/status/${encodeURIComponent(s)}`, auth)
            .then((res) => res.data || [])
            .catch(() => [])
        )
      );

      const repairRequests = results.flat();

      const resVehicles = await axios.get(`${BACKEND_URL}/poolparked/all`, auth);
      const vehicles = resVehicles.data;

      const reminderList = repairRequests.map((req) => {
        const veh = vehicles.find((v) => v.id === req.vehicleId);

        const missing = [];
        if (!req.approvalOrderFile) missing.push("Approval Order");
        if (!req.workOrderFile) missing.push("Work Order");
        if (!req.sanctionOrderFile) missing.push("Sanction Order");

        return {
          requestId: req.id,
          vehicleId: req.vehicleId,
          registrationNo: veh?.registrationNo || "Unknown Vehicle",
          model: veh?.model || "",
          missing,
        };
      });

      setReminders(reminderList);
    } catch (err) {
      console.error("Reminder error:", err);
    }
  };

  useEffect(() => {
    fetchCounts();
    fetchRepairAnalytics();
    buildReminders();
  }, []);

  return (
    <Flex minH="73vh" p={6} bg={useColorModeValue("#f1f2f4", "gray.700")} borderRadius="2xl">

      <Box flex="1">

        {/* ======================= TOP BAR ======================= */}
        <Flex mb={6} align="center">
          <IconButton
            aria-label="menu"
            icon={<HamburgerIcon />}
            display={{ base: "inline-flex", md: "none" }}
          />

          <Heading size="lg" color={useColorModeValue("#222", "#eee")}>
            SAD2 Dashboard
          </Heading>

          <Box flex="1" />

          <HStack spacing={3}>
            <IconButton
              aria-label="toggle-color"
              icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
              onClick={toggleColorMode}
            />
          </HStack>
        </Flex>

        {/* ======================= SUMMARY CARDS ======================= */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4}>

          <MotionBox
            bg={useColorModeValue("#e3e8ec", "#2c2c2c")}
            p={5}
            borderRadius="lg"
            boxShadow="sm"
            whileHover={{ scale: 1.03 }}
          >
            <Text fontSize="sm" color={subtle}>Total Vehicles</Text>
            <Heading size="lg">{counts.total}</Heading>
            <Text fontSize="xs" color="black">Parked Vehicles</Text>
          </MotionBox>

          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="sm" color={subtle}>Unallotted Vehicles</Text>
            <Heading>{counts.unallotted}</Heading>
            <Text fontSize="xs" color="green.500">Available for Allotment</Text>
          </Box>

          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="sm" color={subtle}>Allotted Vehicles</Text>
            <Heading>{counts.allotted}</Heading>
	    <Text fontSize="xs" color="blue.500">Assigned to Departments</Text>
          </Box>

          <Box bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <Text fontSize="sm" color={subtle}>Pending Repair Requests</Text>
            <Heading>{counts.pendingRepair}</Heading>
	    <Text fontSize="xs" color="red.500">Awaiting SAD2 Action</Text>
          </Box>
        </Grid>

        {/* ======================= ANALYTICS SECTION ======================= */}
<Grid templateColumns={{ base: "1fr", md: "2fr 1fr 1fr" }} gap={4} mt={6} alignItems="start">

  {/* ========== BAR CHART (LEFT) – stays same height ========== */}
  <Box bg={cardBg} p={4} borderRadius="lg" boxShadow="sm" height="260px">
    <Heading size="sm" mb={4}>Repair Analytics</Heading>

    <Box height="200px">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={repairStats}>
          <XAxis
            dataKey="status"
            interval={0}
            tick={{ fontSize: 10, angle: -30, textAnchor: "end" }}
            height={70}
          />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#4b5563" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  </Box>

  {/* ========== PENDING UPLOADS (CENTER) – compact size ========== */}
  <Box
    bg={cardBg}
    p={4}
    borderRadius="lg"
    boxShadow="sm"
    height="260px"
    overflow="hidden"
  >
    <Heading size="sm">Pending Uploads</Heading>

    <VStack
      align="stretch"
      mt={3}
      spacing={2}
      overflowY="auto"
      maxH="200px"
      pr={1}
      sx={{
        "&::-webkit-scrollbar": { width: "4px" },
        "&::-webkit-scrollbar-thumb": { background: "#cbd5e1", borderRadius: "2px" },
      }}
    >
      {reminders.length === 0 ? (
        <Text fontSize="sm" color={subtle}>No pending uploads 🎉</Text>
      ) : (
        reminders.map((r) => (
          <Box
            key={r.requestId}
            p={2}
            bg={subBg}
            borderRadius="md"
            border="1px solid"
            borderColor={useColorModeValue("gray.200", "gray.700")}
          >
            <Text fontWeight="bold" fontSize="sm">
              {r.registrationNo} {r.model ? `(${r.model})` : ""}
            </Text>

            <Text fontSize="xs" color="red.500">
              Missing: {r.missing.join(", ")}
            </Text>

          </Box>
        ))
      )}
    </VStack>
  </Box>

  {/* ========== REPAIR PROGRESS (RIGHT) – compact size ========== */}
  <Box
    bg={cardBg}
    p={4}
    borderRadius="lg"
    boxShadow="sm"
    height="260px"
  >
    <Heading size="sm">Repair Progress</Heading>

    <VStack mt={3} spacing={1}>
      <Heading size="lg">{progressData.completed}%</Heading>

      <PieChart width={130} height={130}>
        <Pie
          data={[
            { name: "Completed", value: progressData.completed },
            { name: "In Progress", value: progressData.inProgress },
          ]}
          cx="50%"
          cy="50%"
          innerRadius={28}
          outerRadius={50}
          dataKey="value"
        >
          <Cell fill="#4b5563" />
          <Cell fill="#d1d5db" />
        </Pie>
      </PieChart>

      <Text fontSize="xs" color={subtle}>Repairs Completed</Text>
    </VStack>
  </Box>
</Grid>

      </Box>
    </Flex>
  );
}
