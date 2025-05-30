"use client";

import { useState, useEffect } from 'react';
import {
  Box, AppBar, Stack, Typography, Button, Modal, TextField, Container, Paper,
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
    primary: { main: teal[600], light: teal[400], dark: teal[800] },
    secondary: { main: amber[700], light: amber[500], dark: amber[900] },
    background: { default: blueGrey[50], paper: '#ffffff' }
  }
});

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%',
  transform: 'translate(-50%, -50%)', width: 400,
  bgcolor: 'white', border: '2px solid #ddd', boxShadow: 24,
  p: 4, display: 'flex', flexDirection: 'column', gap: 3, borderRadius: '8px'
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentContactName, setCurrentContactName] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => { updateContacts(); }, []);

  const updateContacts = async () => {
    try {
      const snapshot = query(collection(firestore, 'contacts'));
      const docs = await getDocs(snapshot);
      const contactsList = [];
      docs.forEach((doc) => {
        contactsList.push({
          name: doc.id,
          phone: doc.data().phone,
          email: doc.data().email || ''
        });
      });
      setContacts(contactsList);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpen = (contact = null) => {
    if (contact) {
      setEditMode(true);
      setCurrentContactName(contact.name);
      setName(contact.name);
      setPhone(contact.phone);
      setEmail(contact.email || '');
      setPhoneError('');
    } else {
      setEditMode(false);
      setCurrentContactName(null);
      setName('');
      setPhone('');
      setEmail('');
      setPhoneError('');
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteConfirmOpen(false);
  };

  const openDeleteConfirmation = (contactName) => {
    setCurrentContactName(contactName);
    setDeleteConfirmOpen(true);
  };

  const saveContact = async () => {
    const rawPhone = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(rawPhone)) {
      setPhoneError('Phone number must be a valid 10-digit number.');
      return;
    }
    const formattedPhone = `(${rawPhone.slice(0, 3)}) ${rawPhone.slice(3, 6)}-${rawPhone.slice(6)}`;
    try {
      const docRef = doc(firestore, "contacts", name);
      if (editMode && currentContactName !== name) {
        await deleteDoc(doc(firestore, "contacts", currentContactName));
      }
      await setDoc(docRef, { phone: formattedPhone, email });
      updateContacts();
      handleClose();
    } catch (error) {
      console.error("Error saving contact:", error);
    }
  };

  const deleteContact = async () => {
    try {
      await deleteDoc(doc(firestore, "contacts", currentContactName));
      updateContacts();
      handleClose();
    } catch (error) {
      console.error("Error deleting contact:", error);
    }
  };

  return (
    <>
      <AppBar position="static" sx={{ background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`, height: '100px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>Admin Panel</Typography>
      </AppBar>

      <Container maxWidth="md">
        <Box display="flex" flexDirection="column" alignItems="center" my={5} gap={5}>
          <TextField label="Search" variant="outlined" fullWidth value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: searchQuery ? theme.palette.primary.main : 'inherit' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Paper elevation={2} sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #ddd', backgroundColor: '#fafafa' }}>
          <Stack maxHeight="500px" spacing={0} overflow="auto" divider={<Box sx={{ borderBottom: '1px solid #eee' }} />}>
            {filteredContacts.length === 0 ? (
              <Box py={5} textAlign="center">
                <Typography color="textSecondary">
                  {searchQuery ? 'No contacts match your search.' : 'No contacts yet.'}
                </Typography>
              </Box>
            ) : (
              filteredContacts.map((contact) => (
                <Box key={contact.name} px={4} py={3} display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight="600" fontSize="1.1rem" color={theme.palette.blueGrey}>{contact.name}</Typography>
                    <Typography variant="body2" color="text.secondary">{contact.phone}</Typography>
                    {contact.email && <Typography variant="body2" color="text.secondary">{contact.email}</Typography>}
                  </Box>
                  <Stack direction="row" spacing={1}>
                    <IconButton sx={{ color: theme.palette.primary.light }} onClick={() => handleOpen(contact)}><EditIcon /></IconButton>
                    <IconButton color="error" onClick={() => openDeleteConfirmation(contact.name)}><DeleteIcon /></IconButton>
                  </Stack>
                </Box>
              ))
            )}
          </Stack>
        </Paper>

        <Fab onClick={() => handleOpen()} sx={{ position: 'fixed', bottom: 60, right: 100, backgroundColor: theme.palette.primary.light, '&:hover': { backgroundColor: theme.palette.primary.main } }}>
          <AddIcon />
        </Fab>

        <Modal open={open} onClose={handleClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" fontWeight="600">{editMode ? 'Edit Contact' : 'Add Contact'}</Typography>
            <TextField label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            <TextField label="Phone Number" fullWidth value={phone} onChange={(e) => { setPhone(e.target.value); setPhoneError(''); }} error={!!phoneError} helperText={phoneError} />
            <TextField label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              <Button variant="contained" onClick={saveContact}>Save</Button>
            </Stack>
          </Box>
        </Modal>

        <Modal open={deleteConfirmOpen} onClose={handleClose}>
          <Box sx={modalStyle}>
            <Typography variant="h6" fontWeight="600">Delete Contact</Typography>
            <Typography variant="body1">Are you sure you want to delete this contact? This action cannot be undone.</Typography>
            <Stack direction="row" spacing={2} justifyContent="flex-end" mt={2}>
              <Button variant="outlined" onClick={handleClose}>Cancel</Button>
              <Button variant="contained" color="error" onClick={deleteContact}>Delete</Button>
            </Stack>
          </Box>
        </Modal>
      </Container>
    </>
  );
}
