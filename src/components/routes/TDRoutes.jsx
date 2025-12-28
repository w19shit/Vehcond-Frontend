import React from 'react'
import ScrollToTop from './ScrollToTop'
import LogoutForm from '../../forms/auth/LogoutForm'
import { Box, Center, Spinner, Stack, useDisclosure } from '@chakra-ui/react'
import { useFetchUsersProfile } from "../../hooks/userProfileQueries";

import { Navigate, Outlet } from 'react-router-dom'
import UsersNavbar from '../navigations/users/UsersNavbar'
import UsersSidebar from '../navigations/users/UsersSidebar1'
import UsersSidebarDrawer from '../navigations/users/UsersSidebarDrawer'
import Footer from './Footer'

const TDRoutes = () => {

  const logout = useDisclosure();
  const drawer = useDisclosure();

  const profileQuery = useFetchUsersProfile();

  if(profileQuery.isPending)
  {
    return (
      <Center minH="100dvh">
        <Spinner thickness="4px" size="xl" color="#fdfdfdff" />
      </Center>
    );
  }

  if(profileQuery.isError)
  {
    return <Navigate to="/" />
  }

  if(profileQuery.isSuccess && profileQuery?.data?.data?.role !== "TD")
  {
    return <Navigate to="/" />
  }
  return (
    <>
      <ScrollToTop />

      <LogoutForm isOpen={logout.isOpen} onClose={logout.onClose} />
      
      <UsersNavbar
        onOpen = {drawer.onOpen}
        openLogout={logout.onOpen}
        profile={profileQuery?.data?.data}
      />

      <Stack minH="100dvh" justifyContent="space-between" spacing={8} bg="#fdfdfdff">
              <Stack direction="row" spacing={0}>
                <Box display={{base: "none", lg: "block"}}>
                  <UsersSidebar profile={profileQuery?.data?.data} />
                </Box>
                
                <UsersSidebarDrawer 
                        onOpen={drawer.onOpen} 
                        isOpen={drawer.isOpen} 
                        onClose={drawer.onClose} 
                        profile={profileQuery?.data?.data}
                        navHeight="200px"
                      />
                <Stack spacing={10} w="full" ml={{ base: 0, lg: "258px" }} flex="1" p={4}>
                  <Outlet />
                </Stack>
                
              </Stack>
              <Stack spacing={10} ml={{base: 0, lg: 60}}>
                <Footer fontSize={18} />
              </Stack>
            </Stack>

    </>
  )
}

export default TDRoutes
