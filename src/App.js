import { Grommet, Box, Heading, Footer, Anchor } from "grommet";
import { Linkedin } from "grommet-icons";

import MapsPage from "./pages/map";

const theme = {
  global: {
    font: {
      family: "Roboto",
      size: "18px",
      height: "20px",
    },
  },
};

function App() {
  return (
    <Grommet theme={theme}>
      <Box
        tag="header"
        direction="row"
        align="center"
        alignContent="center"
        justify="between"
        background="brand"
        pad={{ left: "medium", right: "small", vertical: "xsmall" }}
        elevation="medium"
      >
        <Box>
          <Heading size="small">Demo of Google Maps JS APIs in React</Heading>
        </Box>
      </Box>
      <MapsPage />
      <Footer background="light-4" justify="end" pad="small">
        <Anchor
          href="https://www.linkedin.com/in/aditya-kumar-singh-a8b584106/"
          target="_blank"
          textAlign="center"
          size="small"
          label="Designed By Aditya"
          icon={<Linkedin color="blue" />}
          reverse
        />
      </Footer>
    </Grommet>
  );
}

export default App;
