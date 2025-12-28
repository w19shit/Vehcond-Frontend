import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import GuestNavbar from "../navigations/guest/GuestNavbar";
import Footer from "./Footer";
import {
  Center,
  Spinner,
  Stack,
  useDisclosure,
  Box,
} from "@chakra-ui/react";

import { useFetchUsersProfile } from "../../hooks/userProfileQueries";

const GuestRoutes = () => {
  const drawer = useDisclosure();

  const accessToken = localStorage.getItem("access_token");

  // ❌ Do NOT call profile API when user is not logged in
  const profileQuery = accessToken ? useFetchUsersProfile() : null;

  // If logged-in user is loading profile → show spinner
  if (accessToken && profileQuery?.isPending) {
    return (
      <Center minH="100dvh">
        <Spinner thickness="4px" size="xl" color="brand.600" />
      </Center>
    );
  }

  // Auto redirect based on role
  if (accessToken && profileQuery?.isSuccess) {
    const role = profileQuery.data?.data?.role;

    if (role === "ADMIN") return <Navigate to="/admin/dashboard" />;
    if (role === "DA") return <Navigate to="/da/departmentvehicles" />;
    if (role === "TD") return <Navigate to="/td/pendingrepairrequests" />;
    if (role === "SAD1") return <Navigate to="/sad1/vehiclefleet" />;
    if (role === "SAD2") return <Navigate to="/sad2/dashboard" />;
  }

  // Guest layout (no token)
  return (
    <>
      <GuestNavbar onOpen={drawer.onOpen} />

      <Stack
        minH="100vh"
        direction="column"
        justify="flex-start"
        spacing={4}
      >
        <Outlet />

        <Box mt={-4}>
          <Footer />
        </Box>
      </Stack>
    </>
  );
};

export default GuestRoutes;
