"use client";

import {
  Box, Typography, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Alert, Button, Avatar,
  Card, CardContent, CardActions, ThemeProvider, CssBaseline, createTheme
} from "@mui/material";
import {
  Contacts as ContactsIcon,
  Info as InfoIcon,
  Add as AddIcon
} from "@mui/icons-material";
import { amber, blueGrey, teal } from "@mui/material/colors";
import { useEffect, useState } from "react";
import { firestore } from "../firebase";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";

const theme = createTheme({
  palette: {
    primary: { main: teal[600], light: teal[400], dark: teal[800] },
    secondary: { main: amber[700], light: amber[500], dark: amber[900] },
    background: { default: blueGrey[50], paper: "#fff" }
  }
});

export default function AdminPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    const snapshot = await getDocs(collection(firestore, "contacts"));
    const list = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setContacts(list);
  };

  const saveContact = async () => {
    const formattedPhone = phone.trim().replace(/\D/g, "");
    if (!name.trim() || !formattedPhone) {
      setSnackbar({ open: true, message: "Name and phone are required", severity: "error" });
      return;
    }

    try {
      await setDoc(doc(firestore, "contacts", name.trim()), {
        phone: formattedPhone,
        email: email.trim()
      });
      setSnackbar({ open: true, message: "Contact saved", severity: "success" });
      setOpen(false);
      setName(""); setPhone(""); setEmail("");
      loadContacts();
    } catch (error) {
      console.error("Save error:", error);
      setSnackbar({ open: true, message: "Error saving contact", severity: "error" });
    }
  };

  const deleteContact = async (id) => {
    try {
      await deleteDoc(doc(firestore, "contacts", id));
      setSnackbar({ open: true, message: "Contact deleted", severity: "info" });
      loadContacts();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const getInitials = (name) =>
    name.split(" ").map(word => word[0]).join("").toUpperCase().substring(0, 2);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", backgroundColor: theme.palette.background.default }}>
        <Box maxWidth="md" width="100%">
          <Card>
            <Box sx={{ p: 4, pb: 2, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`, color: "white" }}>
              <Box display="flex" alignItems="center" gap={2}>
                <ContactsIcon fontSize="large" />
                <Typography variant="h5" fontWeight="bold">Admin Panel</Typography>
              </Box>
              <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>Manage and sync your contacts to Firebase</Typography>
            </Box>

            <CardContent>
              {contacts.length === 0 ? (
                <Typography variant="body1" align="center" sx={{ py: 5 }}>
                  No contacts yet.
                </Typography>
              ) : (
                contacts.map(c => (
                  <Box key={c.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: teal[600] }}>{getInitials(c.id)}</Avatar>
                      <Box>
                        <Typography fontWeight={600}>{c.id}</Typography>
                        <Typography variant="body2">📞 {c.phone}</Typography>
                        <Typography variant="body2">📧 {c.email || "—"}</Typography>
                      </Box>
                    </Box>
                    <Button sx={{ mt: 1 }} color="error" onClick={() => deleteContact(c.id)}>Delete</Button>
                  </Box>
                ))
              )}
            </CardContent>

            <CardActions sx={{ p: 2, justifyContent: "center" }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                Add Contact
              </Button>
            </CardActions>
          </Card>
        </Box>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add Contact</DialogTitle>
          <DialogContent>
            <TextField margin="dense" label="Name" fullWidth value={name} onChange={(e) => setName(e.target.value)} />
            <TextField margin="dense" label="Phone Number" fullWidth value={phone} onChange={(e) => setPhone(e.target.value)} />
            <TextField margin="dense" label="Email" fullWidth value={email} onChange={(e) => setEmail(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveContact}>Save</Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}
