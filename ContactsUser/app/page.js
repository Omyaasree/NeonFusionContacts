"use client";

import { useState, useEffect } from "react";
import {
  Box, Avatar, Divider, Checkbox, Button, Typography, List, ListItem,
  Container, Snackbar, Alert, Card,
  CardContent, createTheme, CardActions, ThemeProvider, CssBaseline
} from "@mui/material";
import {
  Contacts as ContactsIcon, ContactPhone as ContactIcon,
  Info as InfoIcon, Help as HelpIcon
} from "@mui/icons-material";
import Dialog from '@mui/material/Dialog';
import { amber, blueGrey, teal } from '@mui/material/colors';
import { firestore } from "../firebase";
import { collection, getDocs, query } from "firebase/firestore";

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: "#00FFFF", light: "#66FFFF", dark: "#00CCCC" },
    secondary: { main: "#FF00FF", light: "#FF66FF", dark: "#CC00CC" },
    background: { default: "#0d0d0d", paper: "#1a1a1a" },
    text: { primary: "#FFFFFF", secondary: "#AAAAAA" }
  }
});

function HelpDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ p: 3, maxWidth: 400 }}>
        <Typography variant="h4" gutterBottom>How to Use This Page</Typography>
        <Typography variant="body1" paragraph>
          Use the checkboxes to select which phone numbers you'd like to save.
        </Typography>
        <Typography variant="h6"><strong>For iOS:</strong></Typography>
        <Typography variant="body1" paragraph>
          <ol style={{ paddingLeft: "1.2em" }}>
            <li>Click <strong>Add to Contacts</strong> below</li>
            <li>Tap the download icon in the top right corner</li>
            <li>Select <strong>Contacts</strong> from the options</li>
            <li>Choose <strong>Add All Contacts</strong></li>
            <li>When prompted, select <strong>Create New Contacts</strong></li>
          </ol>
        </Typography>
        <Typography variant="h6"><strong>For Android:</strong></Typography>
        <Typography variant="body1" paragraph>
          <ol style={{ paddingLeft: "1.2em" }}>
            <li>Click <strong>Add to Contacts</strong> below</li>
            <li>When prompted, select <strong>Download</strong></li>
            <li>After the download completes, tap <strong>Open File</strong></li>
            <li>Click <strong>Import</strong>, choose a destination, and confirm by selecting <strong>Import</strong> again</li>
          </ol>
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
          <Button onClick={onClose} variant="contained">Close</Button>
        </Box>
      </Box>
    </Dialog>
  );
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    setHelpOpen(true);
    async function fetchContacts() {
      try {
        const contactsRef = collection(firestore, 'contacts');
        const querySnapshot = await getDocs(query(contactsRef));
        const contactsList = [];
        let counter = 1;
        querySnapshot.forEach((doc) => {
          let data = doc.data();
          let phone = data.phone || "";
          let formattedPhone = phone;
          if (phone.length === 10 && /^\d+$/.test(phone)) {
            formattedPhone = `(${phone.substring(0, 3)}) ${phone.substring(3, 6)}-${phone.substring(6)}`;
          }
          contactsList.push({
            id: counter.toString(),
            name: doc.id,
            phone: formattedPhone,
            rawPhone: phone,
            checked: true
          });
          counter++;
        });
        setContacts(contactsList);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setSnackbar({ open: true, message: "Failed to load contacts. Please try again.", severity: "error" });
      }
    }
    fetchContacts();
  }, []);

  const handleCheckboxChange = (id) => {
    setContacts(contacts.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c)));
  };

  const addToPhoneContacts = async (selectedContacts) => {
    if (!selectedContacts || selectedContacts.length === 0) {
      setSnackbar({ open: true, message: "No contacts selected.", severity: "warning" });
      return;
    }
    const vCards = selectedContacts.map((c) => [
      "BEGIN:VCARD",
      "VERSION:3.0",
      `FN:${c.name}`,
      `N:;${c.name};;;`,
      `TEL;TYPE=CELL:${c.rawPhone}`,
      "END:VCARD"
    ].join("\r\n")).join("\r\n");

    const blob = new Blob([vCards], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts.vcf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HelpDialog open={helpOpen} onClose={() => setHelpOpen(false)} />
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: theme.palette.background.default }}>
        <Container maxWidth="md">
          <Box sx={{ position: 'absolute', top: 20, right: 40 }}>
            <Button variant="contained" onClick={() => setHelpOpen(true)} sx={{ borderRadius: "70%", width: 50, height: 50 }}>
              <HelpIcon />
            </Button>
          </Box>
          <Card>
            <Box sx={{
              p: 4, pb: 2,
              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: "white",
              borderTopLeftRadius: theme.shape.borderRadius,
              borderTopRightRadius: theme.shape.borderRadius
            }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <ContactsIcon fontSize="large" />
                <Typography variant="h5" fontWeight="bold">Import Contacts</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>Select contacts to add to your phone</Typography>
            </Box>

            <CardContent sx={{ px: 0, pb: 8 }}>
              <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                {contacts.length === 0 ? (
                  <Box sx={{ py: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                    <ContactIcon fontSize="large" color="disabled" />
                    <Typography color="text.secondary">No contacts available</Typography>
                  </Box>
                ) : (
                  <List>
                    {contacts.map((c) => (
                      <Box key={c.id} sx={{ '&:hover': { backgroundColor: '#1e1e1e', boxShadow: '0 0 8px #00FFFF' } }}>
                        <ListItem
                          button
                          onClick={() => handleCheckboxChange(c.id)}
                          sx={{
                            py: 2,
                            px: 3,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar
                              sx={{
                                width: 50,
                                height: 50,
                                fontWeight: 800,
                                fontSize: "1.6rem",
                                color: "#00FFFF",
                                bgcolor: "#002B36",
                              }}
                            >
                              {getInitials(c.name)}
                            </Avatar>
                            <Box>
                              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#FFFFFF' }}>
                                {c.name}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                <span style={{ color: '#FF4081', fontSize: '1.2rem' }}>📞</span>
                                <Typography variant="body2" sx={{ color: '#00FFCC', fontWeight: 500, fontSize: '1rem' }}>
                                  {c.phone}
                                </Typography>

                              </Box>
                            </Box>
                          </Box>

                          <Checkbox
                            edge="end"
                            checked={c.checked}
                            sx={{
                              '& .MuiSvgIcon-root': {
                                fontSize: 24,
                                color: c.checked ? '#00FFFF' : '#555'
                              }
                            }}
                          />
                        </ListItem>
                        <Divider />
                      </Box>
                    ))}
                  </List>
                )}
              </Box>
              <CardActions sx={{ pt: 3 }}>
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                  <Button variant="contained" onClick={() => addToPhoneContacts(contacts.filter(c => c.checked))}>Add to Contacts</Button>
                </Box>
              </CardActions>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <InfoIcon fontSize="small" color="disabled" sx={{ fontSize: 16 }} />
                <Typography variant="caption" color="text.secondary" ml={1}>
                  Selected contacts will be added to your device
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

function getInitials(name) {
  const exclude = ['of', 'the'];
  return name.split(' ').filter(word => !exclude.includes(word.toLowerCase())).map(word => word[0]).join('').toUpperCase().substring(0, 2);
}

function getAvatarColor(name) {
  return teal[600];
}
