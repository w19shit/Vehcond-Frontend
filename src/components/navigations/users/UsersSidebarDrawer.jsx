import React from "react";
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useColorModeValue,
  Box,
  IconButton,

} from "@chakra-ui/react";

// import { useFetchMenuLinks } from "../../../hooks/uiQueries";

import { MdOutlineMenu } from "react-icons/md";

import UsersSidebar1 from "./UsersSidebar1";

const UsersSidebarDrawer = ({ isOpen, onOpen, onClose, navHeight, profile }) => {


  return (
  
  <Box 
    bg="gray.200"
    position="fixed"
    top={20}
    left={0}
    zIndex="sticky"
    roundedTopRight="xl"
    roundedBottomRight="xl"
    display={{base: "block", lg: "none"}}
    boxShadow="md"
  >
    <IconButton
      variant="ghost"
      size="lg"
      icon={<MdOutlineMenu size={20} />}
      onClick={onOpen}
      color="white"
      aria-label="Open Menu"
      m={0}

      _hover={{bg: "blue.600"}}
    />

    <Drawer
      as="header"
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      
    >
      <DrawerOverlay
        bg="blackAlpha.700"
        backdropFilter="auto"
        backdropBlur="18px"
        backdropSaturate="180%"
      />
      <DrawerContent bg={useColorModeValue("white", "zinc.950")}>
        <DrawerCloseButton />   

        <DrawerBody as="nav" p={0} overflowY="auto" >
          <UsersSidebar1 profile={profile} onClose={onClose} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  </Box>
    
  );
};

export default UsersSidebarDrawer;
