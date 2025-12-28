import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";

// Backend URL and API key from .env
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const API_KEY = import.meta.env.VITE_API_KEY;

const DriverForm = () => {
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    licenseNumber: "",
    contactNumber: "",
  });
  const toast = useToast();

  // Fetch drivers on mount
  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/driverss`, {
        headers: {Authorization: `Bearer ${localStorage.getItem("access_token")}`,},
      });
      setDrivers(res.data);
    } catch (err) {
      console.error("Error fetching drivers:", err);
      toast({
        title: "Error",
        description: "Could not load drivers.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!form.name || !form.licenseNumber || !form.contactNumber) {
      toast({
        title: "Validation Error",
        description: "All fields are required.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const res = await axios.post(`${BACKEND_URL}/driverss`, form, {
        headers: {Authorization: `Bearer ${localStorage.getItem("access_token")}`,},
      });
      setDrivers([...drivers, res.data]);
      setForm({ name: "", licenseNumber: "", contactNumber: "" });

      toast({
        title: "Driver Added",
        description: "Driver has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error("Error adding driver:", err);
      toast({
        title: "Error",
        description: "Could not add driver.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Stack spacing={6}>
      <Heading size="md" color="black">Drivers</Heading>

      {/* Add Driver Form */}
      <Box bg="white" p={5} shadow="md" borderRadius="md">
        <Stack spacing={4} direction={{ base: "column", md: "row" }}>
          <FormControl isRequired>
            <FormLabel>Name</FormLabel>
            <Input
              placeholder="Enter Driver Name"
              name="name"
              value={form.name}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>License Number</FormLabel>
            <Input
              placeholder="Enter License Number"
              name="licenseNumber"
              value={form.licenseNumber}
              onChange={handleChange}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Contact Number</FormLabel>
            <Input
              placeholder="Enter Contact Number"
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
            />
          </FormControl>

          <Button colorScheme="blue" onClick={handleAdd} mt={{ base: 2, md: 8 }}>
            Add Driver
          </Button>
        </Stack>
      </Box>

      {/* Drivers Table */}
      <Box bg="white" p={5} shadow="md" borderRadius="md">
        <Table variant="simple">
          <Thead bg="gray.100">
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>License Number</Th>
              <Th>Contact Number</Th>
            </Tr>
          </Thead>
          <Tbody>
            {drivers.map(driver => (
              <Tr key={driver.id}>
                <Td>{driver.id}</Td>
                <Td>{driver.name}</Td>
                <Td>{driver.licenseNumber}</Td>
                <Td>{driver.contactNumber}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Stack>
  );
};

export default DriverForm;
