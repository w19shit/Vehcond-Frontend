import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Box, Center, Spinner, Stack, useDisclosure } from "@chakra-ui/react";
import ScrollToTop from "./ScrollToTop";
import LogoutForm from "../../forms/auth/LogoutForm";
import { useFetchUsersProfile } from "../../hooks/userProfileQueries";
import UsersNavbar from "../navigations/users/UsersNavbar";
import UsersSidebar from "../navigations/users/UsersSidebar1";
import UsersSidebarDrawer from "../navigations/users/UsersSidebarDrawer";
import Footer from "../routes/Footer";

const SAD2Routes = () => {
  const logout = useDisclosure();
  const drawer = useDisclosure();
  const profileQuery = useFetchUsersProfile();

  if (profileQuery.isPending) {
    return (
      <Center minH="100vh">
        <Spinner thickness="4px" size="xl" color="#fdfdfdff" />
      </Center>
    );
  }

  if (profileQuery.isError) return <Navigate to="/" />;

  if (profileQuery.isSuccess && profileQuery?.data?.data?.role !== "SAD2") {
    return <Navigate to="/" />;
  }

  return (
    <>
      <ScrollToTop />
      <LogoutForm isOpen={logout.isOpen} onClose={logout.onClose} />
      {/* Header */}
      <UsersNavbar
        onOpen={drawer.onOpen}
        openLogout={logout.onOpen}
        profile={profileQuery?.data?.data}
      />

      {/* Main layout */}
      <Stack direction="row" spacing={0} flex="1" overflow="hidden">
  {/* Sidebar for large screens */}
  <Box display={{ base: "none", lg: "block" }}>
    <UsersSidebar profile={profileQuery?.data?.data} />
  </Box>

  {/* Sidebar drawer for small screens */}
  <UsersSidebarDrawer
    onOpen={drawer.onOpen}
    isOpen={drawer.isOpen}
    onClose={drawer.onClose}
    profile={profileQuery?.data?.data}
  />

  {/* Main content area */}
  <Box
    flex="1"
    ml={{ base: 0, lg: "258px" }}
    display="flex"
    flexDirection="column"
    overflow="hidden"
  >
    <Box flex="1" overflow="auto" p={4}>
      <Outlet /> {/* Page content goes here */}
    </Box>
    <Footer fontSize={18} />
  </Box>
</Stack>
    </>
  );
};

export default SAD2Routes;
