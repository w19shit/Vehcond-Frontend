import React from "react";

import { NavLink, Link as RouterLink } from "react-router-dom";

import {
  Button,
  Hide,
  Stack,
  HStack,
  IconButton,
  Link,
  Show,
  useColorMode,
  useColorModeValue,
  Image,
  Box,
  Flex,
  Spacer,
  Text,

  useDisclosure
} from "@chakra-ui/react";


import { MdOutlineMenu} from "react-icons/md"

import megEmblem from "../../../assets/meg_emblem.png";

import GuestNavDrawer from "./GuestNavDrawer";

const GuestNavbar = () => {
  const links = [
    { label: "Home", path: "/" },
    { label: "Contact Us", path: "/contact-us" },
    { label: "Privacy Policy", path: "/privacy-policy" },
  ];

 
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <Box 
      as="nav" 
      bg="#ffffff" 
      boxShadow="2xl" 
      w="100%" 
      pt={3} 
      pr={16} 
      pb={3} 
      pl={16} 
      color="black" 
      fontFamily="David Libre, sans serif"
      >
        <Flex align="center" spacing={4} fontFamily="David Libre, sans serif">
          {/* Meghalaya Logo */}
          <Image 
            src={megEmblem} 
            w={20} 
            h={20} 
            alt="Logo"
          />
          {/* Vertical line */}
          <Box width="1px" h="55px" bg="black" ml={2} />
          <Box ml={2}>
            <Text fontSize="13px"> Vehicle Management System 1.0 </Text>
            <Text fontSize="13px"> Transport Department </Text>
            <Text fontSize="13px"> Government of Meghalaya </Text>
          </Box>

          
          
          <Spacer />
          {/* Desktop Navigation Links */}
          <Show above="lg">
            <Box 
              flex="1" 
              mb={{ base: 6, md: 0 }} 
              textAlign="center"
              display="flex"         
              justifyContent="center" 
              gap={6}              
            >
              {links.map((link) => (
                <Link 
                  as={NavLink}
                  variant="nav"
                  to={link.path}
                  key={link.path}
                  fontSize="18px"
                  color="black"
                  _hover={{ color: "teal" }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Show>

          {/* Mobile Navigation Links */}
          <Hide above="lg">
            <IconButton
              variant="ghost"
              icon={<MdOutlineMenu size={20} />}
              aria-label="Open Menu"
              onClick={onOpen}
            />

          </Hide>
        </Flex>
      </Box>

      <GuestNavDrawer isOpen={isOpen} onClose={onClose} />
    </>
    
    // <Stack>
    //   <Header borderBottom="none" pos="relative">
    //     <HStack direction="row" justifyContent="space-between">
    //       {/* LHS */}

    //       <Link as={RouterLink} variant="logo" to="/">
    //         <HStack spacing={4}>
    //           <Image
    //             src={meghalayaImg}
    //             w={16}
    //             h={16}
    //             alt="Meghalaya Emblem"
    //             rounded="full"
    //           />
    //           <Image
    //             src={emblemSvg}
    //             h={16}
    //             alt="Indian Emblem"
    //             filter={useColorModeValue("none", "auto")}
    //             brightness={0}
    //             invert={1}
    //           />
    //           <Image src={digitalImg} h={16} alt="Digital India" />{" "}
    //         </HStack>
    //       </Link>

    //       {/* MID */}
    //       <HStack
    //         as="ul"
    //         spacing={8}
    //         listStyleType="none"
    //         display={{ base: "none", xl: "flex" }}
    //       >
    //         {links.map((link) => (
    //           <li key={link.path}>
    //             <Link as={NavLink} variant="nav" to={link.path}>
    //               {link.label}
    //             </Link>
    //           </li>
    //         ))}
    //       </HStack>

    //       {/* RHS */}
    //       <HStack>
    //         <IconButton
    //           variant="ghost"
    //           icon={
    //             colorMode === "light" ? (
    //               <MdOutlineWbSunny size={20} />
    //             ) : (
    //               <AiOutlineMoon size={20} />
    //             )
    //           }
    //           onClick={toggleColorMode}
    //         />
    //         {/* <Hide below="xl">
    //           <Button variant="brand" as={RouterLink} to="/auth/sign-in">
    //             Official's Sign In
    //           </Button>
    //         </Hide> */}
    //         <Show below="xl">
    //           <IconButton
    //             variant="ghost"
    //             icon={<MdOutlineMenu size={20} />}
    //             onClick={onOpen}
    //           />
    //         </Show>
    //       </HStack>
    //     </HStack>
    //   </Header>
    // </Stack>
  );
};

export default GuestNavbar;
