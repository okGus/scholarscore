'use client'
import { useState } from 'react'
import { Box, Stack, TextField, Button } from '@mui/material'

export default function Home() {
  const [link, setLink] = useState('')

  const fetchReviews = async (link: string) => {
    const response = await fetch('http://127.0.0.1:5000/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: link }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch reviews');
    }
    
    const data = await response.json();
    console.log(data.reviews);
    // return data.reviews;
  }


  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am a Professor support assistant. Ask me anything.'
    }
  ])

  const [message, setMessage] = useState('')
  const sendMessage = async () => {
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ])

    setMessage('')

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([...messages, { role: 'user', content: message }])
    })

    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    let result = ''
    
    const processText = async ({ done, value }: ReadableStreamReadResult<Uint8Array>): Promise<string> => {
      if (done) {
        return result
      }
      const text = decoder.decode(value || new Uint8Array(), { stream: true })
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]
        let otherMessages = messages.slice(0, messages.length - 1)
        return [
          ...otherMessages,
          { ...lastMessage, content: lastMessage.content + text },
        ]
      })

      // Recursively call processText until done
      result += text
      return reader.read().then(processText)
    }

    await reader.read().then(processText)
  }

  return (
    <Box width="100vw" height="100vh" display="flex" flexDirection="row" p={2} alignItems="center">
      {/* Box for uploading website link */}
      <Box width="300px" p={2} border="1px solid black" mr={2}>
      <TextField
        label="Enter Rate My Professor Link"
        fullWidth
        value={link}
        onChange={(e) => setLink(e.target.value)}
        sx={{
          '& .MuiInputBase-input': {
            color: 'white', // Ensure the text color inside the TextField is black for readability
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: 'white', // Optional: change border color if needed
            },
            '&:hover fieldset': {
              borderColor: 'white', // Optional: change border color on hover
            },
            '&.Mui-focused fieldset': {
              borderColor: 'white', // Optional: change border color when focused
            }
          }
        }}
      />
      <Button variant="contained" onClick={() => fetchReviews(link)}>Fetch Reviews</Button>
    </Box>

    <Box width="100vw" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <Stack direction="column" width="500px" height="700px" border="1px solid black" p={2} spacing={3}>
        <Stack direction="column" spacing={2} flexGrow={1} overflow={'auto'} maxHeight={"100%"}>
          {messages.map((message, index) => (
            <Box key={index} display="flex" justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}>
              <Box bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} color='white' borderRadius={3} p={3}>
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={2} mt={2}>
        <TextField
          label="Message"
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            '& .MuiInputBase-input': {
              color: 'white', // Ensures the text color inside the TextField is white
            },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'white', // Optional: change border color if needed
              },
              '&:hover fieldset': {
                borderColor: 'white', // Optional: change border color on hover
              },
              '&.Mui-focused fieldset': {
                borderColor: 'white', // Optional: change border color when focused
              }
            }
          }}
        />
        <Button variant="contained" onClick={sendMessage}>Send</Button>
      </Stack>
    </Box>
  </Box>
  )
}
