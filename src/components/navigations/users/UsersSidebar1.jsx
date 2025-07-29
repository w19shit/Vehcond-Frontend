import { useState, useMemo } from "react";
import { Box, Collapse, Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";

import { Link as RouterLink, NavLink } from "react-router-dom";

import { useFetchMenuLinks } from "../../../hooks/uiQueries";

import MdIcon from "../../core/MdIcon";

import { 
  MdArrowForward, 
  MdArrowDownward 
} from "react-icons/md";

const UsersSidebar = ({ profile, onClose }) => {

  // Queries
  const menuQuery = useFetchMenuLinks();

  const sortedMenu = useMemo(() => {
    return menuQuery?.data?.data || [];
  
  }, [menuQuery?.data?.data]);

  const[openSubmenu, setOpenSubMenu] = useState({});

  const toggleSubMenu = (urlCode) =>
  {
    setOpenSubMenu((prev) => ({
      ...prev,
      [urlCode] : !prev[urlCode],
    }));
  };

  const handleLinkClick = (event, link) => 
  {
    if(link.subProcessName)
    {
      event.preventDefault();
      toggleSubMenu(link.urlCode);
    }else{
      if(onClose){
      onClose();
    }
    }
  };

  const handleLeafLinkClick = () => {
    if(onClose)
    {
      onClose();
    }
  }

  const groupMenuItems = (menuItems) => {
    return menuItems?.reduce((groups, item) => {
      if (item.showInMenu) {
        if (!groups[item.processName]) {
          groups[item.processName] = [];
        }
        groups[item.processName].push(item);
      }
      return groups;
    }, {});
  };

  const groupedMenu = groupMenuItems(sortedMenu);

  return (
    <Stack
      
      w={258}
      borderColor="border"
      bg="#ffffff"
      //minH="100dvh"
      h="100dvh"
      pos="fixed"
      top={0}
      left={0}
      py={7}
      
      zIndex="dock"
      boxShadow="-5px 0px 5px rgba(0,0,0,0.1)"
      // boxShadow={{base: "md", lg: "-5px 0 5px rgba(0,0,0,0.1)"}}
      overflowY="auto"
    >
      <Stack spacing={8}>

        <Box px={4} textAlign="left">
          <Link
            as={RouterLink}
            variant="logo"
            to={
              profile?.role === "USER"
                ? "/user/dashboard"
                : profile?.role === "DA"
                ? "/da/dashboard"
                : profile?.role === "TD"
                ? "/td/dashboard"
                : profile?.role === "ADMIN"
                ? "/admin/dashboard"
                : ""
            }
            onClick={handleLeafLinkClick}
          >
          </Link>
        </Box>

        {/* Menu */}
        <Stack 
          spacing={1} 
          mt={10} 
          pl={6}
          flex="1"
          overflowY="auto"
          pb={4}
          sx={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              background: 'transparent',
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'gray.300',
              borderRadius: '3px',
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'gray.400',
            },
          }}
        >
          {Object.entries(groupedMenu).map(([processName, items]) => {
            const mainLink = items[0]; 
            return (
              <Box key={processName} pr={2}>
                <Link
                  as={NavLink}
                  // variant="sidebar"
                  to={mainLink.pageurl}
                  onClick={(e) => handleLinkClick(e, mainLink)}
                  display="flex"
                  alignItems = "center"
                  px={4}
                  py={2}
                  _hover={{ textDecor: "none", bg: "gray.100", color: "blue.500" }}
                  _active={{ bg: "blue.50", color: "blue.700" }}
                  _focus={{ outline: "none" }}
                  _visited={{ color: "gray.600" }}
                  borderRadius="md"
                  fontWeight="medium"
                  aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                  // isActive={(match, location) => {

                  //   if (!match) return false;
                  //   // If it has subitems and a submenu is open, don't mark parent active unless it's the current page
                  //   if (items.some(item => item.subProcessName) && openSubmenu[mainLink.urlCode]) {
                  //       return location.pathname === mainLink.pageurl;
                  //   }
                  //   return true;
                  // }}
                >
                  <HStack flex="1">
                    <MdIcon iconName={mainLink.processIcon} color="gray.600" _hover={{ color: "blue.500" }} />
                    <Text color="gray.600" _hover={{ color: "blue.500" }}>
                      {processName}
                    </Text>
                    {items.some((item) => item.subProcessName) && (
                      <Box ml="auto">
                        {openSubmenu[mainLink.urlCode] ? <MdArrowDownward size="20px" /> : <MdArrowForward size="20px" />}
                      </Box>
                    )}
                  </HStack>
                </Link>

                {items.some((item) => item.subProcessName) && (
                  <Collapse in={openSubmenu[mainLink.urlCode]} animateOpacity>
                    <Stack spacing={1} pl={6} mt={1} py={1}>
                      {items.map((item) => {
                        if (item.subProcessName) {
                          return (
                            <Link
                              key={item.subProcessName}
                              as={NavLink}
                              // variant="sidebar"
                              to={item.pageurl}

                              onClick = {handleLeafLinkClick}
                              
                              _hover={{ textDecor: "none", color: "blue.500" }}
                              _active={{ textDecor: "none", color: "blue.500" }}
                              _focus={{ outline: "none" }}
                              _visited={{ color: "gray.600" }}
                              display="flex"
                              alignItems="center"

                              px={4}
                              py={1.5}
                              borderRadius="md"
                              fontSize="sm"

                              aria-current={({ isActive }) => (isActive ? "page" : undefined)}
                              // isActive={(match, location) => {
                              //   if (!match) return false;
                              //   return location.pathname === item.pageurl;
                              // }}
                            >
                              <HStack spacing={3}>
                                <MdIcon iconName={item.subProcessIcon} color="gray.600" _hover={{ color: "blue.500" }}/>
                                <Text color="gray.600" _hover={{ color: "blue.500" }}>
                                  {item.subProcessName}
                                </Text>
                              </HStack>
                            </Link>
                          );
                        }
                        return null;
                      })}
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