import { useState, useMemo } from "react";
import {
  Box,
  Collapse,
  Heading,
  HStack,
  Link,
  Stack,
  Text,
  Spinner,
} from "@chakra-ui/react";
import { Link as RouterLink, NavLink } from "react-router-dom";
import { useFetchMenuLinks } from "../../../hooks/uiQueries";
import MdIcon from "../../core/MdIcon";
import { MdArrowForward, MdArrowDownward } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// 🔹 Fetch count dynamically based on role
const fetchPendingCount = async (role) => {
  const token = localStorage.getItem("access_token");
  if (!role || !token) return 0;

  let statuses = [];

  if (role === "TD") {
    // ✅ Transport Department
    statuses = ["Pending with Transport"];
  } else if (role === "SAD2") {
    // ✅ SAD2 Role (from Pending with SAD2 → Work Order Uploaded)
    statuses = [
      "Pending with SAD2",
      "Pending with Transport",
      "Repair Estimated",
      "Approval Order Uploaded",
      "Work Order Uploaded",
    ];
  } else {
    // Other roles don’t show pending repair request count
    return 0;
  }

  const results = await Promise.all(
    statuses.map((s) =>
      axios
        .get(`${BACKEND_URL}/repairrequest/status/${encodeURIComponent(s)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => res.data || [])
        .catch(() => [])
    )
  );

  // ✅ Total requests from relevant statuses
  const allRequests = results.flat();
  // ❌ Exclude “Approved for Repair” or “Sanction Order Uploaded”
  const filtered = allRequests.filter(
    (r) =>
      !r.status?.toLowerCase().includes("approved for repair") &&
      !r.status?.toLowerCase().includes("sanction order uploaded")
  );

  return filtered.length;
};

const UsersSidebar = ({ profile, onClose }) => {
  const menuQuery = useFetchMenuLinks();
  const sortedMenu = useMemo(() => menuQuery?.data?.data || [], [menuQuery?.data?.data]);
  const [openSubmenu, setOpenSubMenu] = useState({});

  // ✅ Role-based query key and fetch logic
  const { data: pendingCount = 0, isLoading } = useQuery({
    queryKey: ["pendingRepairRequestsCount", profile?.role],
    queryFn: () => fetchPendingCount(profile?.role),
    refetchInterval: 10000, // refresh every 10 sec
    enabled: !!profile?.role, // run only when role is known
  });

  const toggleSubMenu = (urlCode) => {
    setOpenSubMenu((prev) => ({
      ...prev,
      [urlCode]: !prev[urlCode],
    }));
  };

  const handleLinkClick = (event, link) => {
    if (link.subProcessName) {
      event.preventDefault();
      toggleSubMenu(link.urlCode);
    } else if (onClose) {
      onClose();
    }
  };

  const groupedMenu = sortedMenu?.reduce((acc, item) => {
    if (item.showInMenu) {
      if (!acc[item.processName]) acc[item.processName] = [];
      acc[item.processName].push(item);
    }
    return acc;
  }, {});

  return (
    <Stack
      w={258}
      bg="gray.700"
      color="gray.100"
      h="100dvh"
      pos="fixed"
      top={0}
      left={0}
      py={7}
      zIndex="dock"
      boxShadow="2xl"
      overflowY="auto"
      borderRadius="md"
      sx={{
        "&::-webkit-scrollbar": { width: "6px" },
        "&::-webkit-scrollbar-thumb": { background: "gray.500", borderRadius: "3px" },
      }}
    >
      <Stack spacing={8}>
        {/* ===== App Header ===== */}
        <Box px={4} textAlign="center">
          <Link
            as={RouterLink}
            to={
              profile?.role === "USER"
                ? "/user/dashboard"
                : profile?.role === "DA"
                ? "/da/dashboard"
                : profile?.role === "TD"
                ? "/td/dashboard"
                : profile?.role === "SAD1"
                ? "/sad1/dashboard"
                : profile?.role === "SAD2"
                ? "/sad2/dashboard"
                : profile?.role === "ADMIN"
                ? "/admin/dashboard"
                : "/"
            }
            _hover={{ textDecoration: "none" }}
            onClick={onClose}
          >
            <Heading size="md" color="white">
            </Heading>
          </Link>
        </Box>

        {/* ===== Menu ===== */}
        <Stack spacing={1} mt={10} pl={6} flex="1" overflowY="auto" pb={4}>
          {Object.entries(groupedMenu).map(([processName, items]) => {
            const mainLink = items[0];
            return (
              <Box key={processName} pr={2}>
                <Link
                  as={NavLink}
                  to={mainLink.pageurl}
                  onClick={(e) => handleLinkClick(e, mainLink)}
                  display="flex"
                  alignItems="center"
                  px={4}
                  py={2}
                  borderRadius="md"
                  _hover={{ bg: "gray.600" }}
                >
                  <HStack flex="1" spacing={2}>
                    <MdIcon iconName={mainLink.processIcon} color="gray.300" />
                    <HStack spacing={2}>
                      <Text color="gray.200">{processName}</Text>

                      {/* ✅ Pending Repair Requests Badge */}
                      {processName === "Pending Repair Requests" &&
                        (isLoading ? (
                          <Spinner size="xs" color="gray.300" />
                        ) : pendingCount > 0 ? (
                          <Box
                            bg="red.400"
                            minW="18px"
                            h="18px"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            borderRadius="full"
                            fontSize="xs"
                            fontWeight="bold"
                            color="white"
                            position="relative"
                            top="-1px"
                            ml={1}
                          >
                            {pendingCount}
                          </Box>
                        ) : null)}
                    </HStack>

                    {items.some((i) => i.subProcessName) && (
                      <Box ml="auto" color="gray.400">
                        {openSubmenu[mainLink.urlCode] ? (
                          <MdArrowDownward size="18px" />
                        ) : (
                          <MdArrowForward size="18px" />
                        )}
                      </Box>
                    )}
                  </HStack>
                </Link>

                {/* ===== Submenu ===== */}
                {items.some((i) => i.subProcessName) && (
                  <Collapse in={openSubmenu[mainLink.urlCode]} animateOpacity>
                    <Stack spacing={1} pl={6} mt={1} py={1}>
                      {items.map(
                        (item) =>
                          item.subProcessName && (
                            <Link
                              key={item.subProcessName}
                              as={NavLink}
                              to={item.pageurl}
                              onClick={onClose}
                              display="flex"
                              alignItems="center"
                              px={4}
                              py={1.5}
                              fontSize="sm"
                            >
                              <HStack spacing={3}>
                                <MdIcon
                                  iconName={item.subProcessIcon}
                                  color="gray.400"
                                />
                                <Text color="gray.300">
                                  {item.subProcessName}
                                </Text>
                              </HStack>
                            </Link>
                          )
                      )}
                    </Stack>
                  </Collapse>
                )}
              </Box>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default UsersSidebar;
