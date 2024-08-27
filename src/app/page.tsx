"use client";
import { useState, useRef, useEffect } from "react";
import {
  Box,
  Stack,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { motion } from "framer-motion";

// Create a dark theme
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#BB86FC",
    },
    secondary: {
      main: "#03DAC6",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
  },
});

// Framer Motion variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1 },
};

export default function Home() {
  const [link, setLink] = useState("");
  // Advanced search state
  const [subject, setSubject] = useState("");
  const [teachingStyle, setTeachingStyle] = useState("");
  const [difficultyLevel, setDifficultyLevel] = useState("");
  const [gradingFairness, setGradingFairness] = useState("");
  const [availability, setAvailability] = useState("");

  const fetchReviews = async (link: string) => {
    const response = await fetch("http://127.0.0.1:5000/api/chat/scrape/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: link }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch reviews");
    }

    const data = await response.json();
    console.log(data.reviews);
    // return data.reviews;
  };

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I am a Professor support assistant. Ask me anything.",
    },
  ]);

  const [message, setMessage] = useState("");

  const sendMessage = async (messageToSend: string) => {
    setMessages((messages) => [
      ...messages,
      { role: "user", content: messageToSend },
      { role: "assistant", content: "" },
    ]);

    setMessage("");

    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify([
        ...messages,
        { role: "user", content: messageToSend },
      ]),
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    let result = "";

    const processText = async ({
      done,
      value,
    }: ReadableStreamReadResult<Uint8Array>): Promise<string> => {
      if (done) {
        return result;
      }
      const text = decoder.decode(value || new Uint8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ];
      });

      // Recursively call processText until done
      result += text;
      return reader.read().then(processText);
    };

    await reader.read().then(processText);
  };

  const handleAdvancedSearch = () => {
    const searchMessage = `Find professors for ${subject} with ${teachingStyle} teaching style, ${difficultyLevel} difficulty, ${gradingFairness} grading, and ${availability} availability outside class.`;
    sendMessage(searchMessage);
  };

  const chatBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <ThemeProvider theme={darkTheme}>
      <Box
        component={motion.div}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          p: 2,
          bgcolor: "background.default",
          overflow: "hidden",
        }}
      >
        <Stack direction="row" spacing={2} mb={2}>
          <Box component={motion.div} variants={itemVariants} flex={1}>
            <TextField
              label="Enter Rate My Professor Link"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              variant="outlined"
            />
          </Box>
          <motion.div variants={itemVariants}>
            <Button variant="contained" onClick={() => fetchReviews(link)}>
              Fetch Reviews
            </Button>
          </motion.div>
        </Stack>

        <Stack direction="row" spacing={2} flex={1} overflow="hidden">
          <Paper
            component={motion.div}
            variants={itemVariants}
            elevation={3}
            sx={{
              width: 300,
              p: 2,
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Search for Professors
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                variant="outlined"
                fullWidth
              />
              <FormControl fullWidth variant="outlined">
                <InputLabel>Teaching Style</InputLabel>
                <Select
                  value={teachingStyle}
                  label="Teaching Style"
                  onChange={(e) => setTeachingStyle(e.target.value)}
                >
                  <MenuItem value="hands-on">Hands-on</MenuItem>
                  <MenuItem value="lecture">Lecture</MenuItem>
                  <MenuItem value="interactive">Interactive</MenuItem>
                  <MenuItem value="discussion">Discussion</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Difficulty Level</InputLabel>
                <Select
                  value={difficultyLevel}
                  label="Difficulty Level"
                  onChange={(e) => setDifficultyLevel(e.target.value)}
                >
                  <MenuItem value="easy">Easy</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="hard">Hard</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Grading Fairness</InputLabel>
                <Select
                  value={gradingFairness}
                  label="Grading Fairness"
                  onChange={(e) => setGradingFairness(e.target.value)}
                >
                  <MenuItem value="very fair">Very Fair</MenuItem>
                  <MenuItem value="fair">Fair</MenuItem>
                  <MenuItem value="strict">Strict</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Availability Outside</InputLabel>
                <Select
                  value={availability}
                  label="Availability Outside"
                  onChange={(e) => setAvailability(e.target.value)}
                >
                  <MenuItem value="very available">Very Available</MenuItem>
                  <MenuItem value="somewhat available">
                    Somewhat Available
                  </MenuItem>
                  <MenuItem value="limited availability">
                    Limited Availability
                  </MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAdvancedSearch}
                fullWidth
              >
                Search Professors
              </Button>
            </Box>
          </Paper>
          <Paper
            component={motion.div}
            variants={itemVariants}
            elevation={3}
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              ref={chatBoxRef}
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                display: "flex",
                flexDirection: "column",
                gap: 2,
                "&::-webkit-scrollbar": {
                  width: "6px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "rgba(255, 255, 255, 0.1)", // Faint contrast for the track
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "rgba(187, 134, 252, 0.5)", // Matches the primary main color (#BB86FC)
                  borderRadius: "8px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "rgba(187, 134, 252, 0.7)", // Darker hover effect for the thumb
                },
              }}
            >
              {messages.map((message, index) => (
                <Box
                  key={index}
                  component={motion.div}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  alignSelf={
                    message.role === "assistant" ? "flex-start" : "flex-end"
                  }
                  sx={{
                    maxWidth: "70%",
                    bgcolor:
                      message.role === "assistant"
                        ? "primary.main"
                        : "secondary.main",
                    color: "background.paper",
                    borderRadius: 2,
                    p: 2,
                    boxShadow: 2,
                  }}
                >
                  <Typography>{message.content}</Typography>
                </Box>
              ))}
            </Box>
            <Stack
              component={motion.div}
              variants={itemVariants}
              direction="row"
              spacing={2}
              p={2}
              bgcolor="background.paper"
            >
              <TextField
                label="Message"
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                variant="outlined"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage(message);
                  }
                }}
              />
              <Button variant="contained" onClick={() => sendMessage(message)}>
                Send
              </Button>
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </ThemeProvider>
  );
}
