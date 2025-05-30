// UPDATED USER PAGE (page.js)

"use client";

import { useState, useEffect } from 'react';
import {
  Box, AppBar, Toolbar, Stack, Typography, Button, Modal, TextField, Container, Paper,
  InputAdornment, IconButton, Fab, createTheme
} from '@mui/material';
import {
  Search as SearchIcon, Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon
} from '@mui/icons-material';
import { firestore } from '../firebase';
import {
  collection, doc, getDocs, setDoc, deleteDoc, query
} from 'firebase/firestore';
import { amber, blueGrey, teal } from '@mui/material/colors'

const theme = createTheme({
  palette: {
    primary: {
      main: teal[600],
      light: teal[400],
      dark: teal[800]
    },
    secondary: {
      main: amber[700],
      light: amber[500],
      dark: amber[900]
    },
    background: {
      default: blueGrey[50],
      paper: '#ffffff'
    }
  }
});

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const updateContacts = async () => {
      try {
        const snapshot = query(collection(firestore, 'contacts'));
        const docs = await getDocs(snapshot);
        const contactsList = [];
        docs.forEach((document) => {
          contactsList.push({
            name: document.id,
            phone: document.data().phone,
            email: document.data().email || ""
          });
        });
        setContacts(contactsList);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    updateContacts();
  }, []);

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <AppBar position="static" sx={{
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        width: '100%', height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
          Contact Book
        </Typography>
      </AppBar>

      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" alignItems="center" my={5} gap={5}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: searchQuery ? theme.palette.primary.main : 'inherit' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: theme.palette.primary.main,
              }
            }}
          />
        </Box>

        <Paper elevation={2} sx={{
          width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', backgroundColor: '#fafafa'
        }}>
          <Stack maxHeight="500px" spacing={0} overflow="auto" divider={<Box sx={{ borderBottom: '1px solid #eee' }} />}>
            {filteredContacts.length === 0 ? (
              <Box py={5} textAlign="center">
                <Typography color="textSecondary">
                  {searchQuery ? 'No contacts match your search.' : 'No contacts yet.'}
                </Typography>
              </Box>
            ) : (
              filteredContacts.map((contact) => (
                <Box
                  key={contact.name}
                  px={4} py={3} display="flex" flexDirection="column"
                  sx={{
                    transition: 'background-color 0.3s ease',
                    '&:hover': { backgroundColor: 'rgba(187, 222, 71, 0.05)' }
                  }}
                >
                  <Typography fontWeight="600" fontSize="1.1rem" color={theme.palette.blueGrey}>
                    {contact.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {contact.phone}
                  </Typography>
                  {contact.email && (
                    <Typography variant="body2" color="error">
                      {contact.email}
                    </Typography>
                  )}
                </Box>
              ))
            )}
          </Stack>
        </Paper>
      </Container>
    </>
  );
}
