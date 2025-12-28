import React from "react";

import Header from "../../core/semantics/Header";

import { Link as RouterLink, useLocation } from "react-router-dom";

import {
  Avatar,
  AvatarBadge,
  Heading,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Show,
  useColorMode,
  useColorModeValue,
  Image,
  Text,
  Box
} from "@chakra-ui/react";

import {
  MdOutlineLogout,
  MdOutlineMenu,
  MdOutlineWbSunny,
} from "react-icons/md";

import { useFetchMenuLinks } from "../../../hooks/uiQueries";

import { AiOutlineMoon } from "react-icons/ai";

import meghEmblem from "../../../assets/meg_emblem.png";

const UsersNavbar = ({ openLogout, profile }) => {
  // Hooks
  const { colorMode, toggleColorMode } = useColorMode();

  // Routers
  const location = useLocation();
  // Remove the last path
  const splitPathname = location.pathname.split("/");
  const slicedPathname =
    splitPathname.length <= 3 ? splitPathname : splitPathname.slice(0, -1);
  const pathname = slicedPathname.join("/");

  // Queries
  const menuQuery = useFetchMenuLinks();

  return (
    <Header maxW={null} bg="background" position="fixed">

      <HStack direction="row" justifyContent="space-between">
        {/* LHS */}
        <HStack>
          {/* <Show below="lg">
            <IconButton
              variant="ghost"
              icon={<MdOutlineMenu size={20} />}
              onClick={onOpen}
            />
          </Show> */}
          
          <Image 
            src={meghEmblem}
            w="50px"
            h="50px"
            alt="Meghalaya Emblem"
          />

          <Box >
            <Text> Vehicle Management System</Text>
          </Box>

          
          <Link as={RouterLink} variant="logo" to={pathname}>
            <Heading size="md">
              {
                menuQuery?.data?.data?.find((row) => row.url === pathname)
                  ?.label
              }
            </Heading>{" "}
          </Link>
        </HStack>

        {/* RHS */}
        <HStack>
          <Menu>
            <HStack spacing={3}>
              <Box textAlign="right" lineHeight="1.1">
                <Text fontWeight="bold" fontSize="sm">
                  {profile?.name}
                </Text>
              </Box>

              <Menu>
                <MenuButton>
                  <Avatar name={profile?.name} size="md">
                    <AvatarBadge boxSize="1rem" bg="green.400" />
                  </Avatar>
                </MenuButton>
                <MenuList>
                  <MenuItem icon={<MdOutlineLogout />} onClick={openLogout}>
                    Logout
                  </MenuItem>
                </MenuList>
              </Menu>
            </HStack>
            <MenuList>
              <MenuItem
                icon={<MdOutlineLogout size={16} />}
                onClick={openLogout}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>

        </HStack>
      </HStack>
    </Header>
  );
};

export default UsersNavbar;
