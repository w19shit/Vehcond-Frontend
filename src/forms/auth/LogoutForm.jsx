import React from "react";
import {
  Button,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useLogoutUser } from "../../hooks/authQueries";
import { client } from "../../components/utils/request"; // ✔ correct import

const LogoutForm = ({ isOpen, onClose }) => {
  const toast = useToast();
  const navigate = useNavigate();

  const logoutQuery = useLogoutUser(
    () => {
      onClose();

      // Remove everything
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("role");
      localStorage.removeItem("saved_form");

      delete client.defaults.headers.common["Authorization"]; // ✔ important

      navigate("/");

      return true;
    },
    (error) => {
      toast({
        isClosable: true,
        duration: 3000,
        position: "top-right",
        status: "error",
        title: "Error",
        description:
          error.response?.data?.detail ||
          "Something went wrong. Couldn't logout user.",
      });
      return error;
    }
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay>
        <ModalContent>
          <ModalCloseButton />
          <ModalHeader fontSize="lg" fontWeight="bold">Log out</ModalHeader>
          <ModalBody>Are you sure you want to logout?</ModalBody>
          <ModalFooter as={HStack}>
            <Button variant="outline" onClick={onClose} w="full">Cancel</Button>
            <Button
              colorScheme="red"
              onClick={() => logoutQuery.mutate()}
              w="full"
              isLoading={logoutQuery.isPending}
              loadingText="Logging Out"
            >
              Log out
            </Button>
          </ModalFooter>
        </ModalContent>
      </ModalOverlay>
    </Modal>
  );
};

export default LogoutForm;
