import { drawerAnatomy as parts } from "@chakra-ui/anatomy";
import { createMultiStyleConfigHelpers } from "@chakra-ui/styled-system";

const { definePartsStyle, defineMultiStyleConfig } =
  createMultiStyleConfigHelpers(parts.keys);

const baseStyle = definePartsStyle({
  // define the part you're going to style
  overlay: {
    bg: "gray.200", //change the background
    backdropFilter: "auto",
    backdropBlur: "18px",
    backdropSaturate: "180%",
  },
  dialog: {
    _light: {
      bg: "white",
    },

    _dark: {
      bg: "zinc.900",
    },
  },
});

export const drawerTheme = defineMultiStyleConfig({
  baseStyle,
});
