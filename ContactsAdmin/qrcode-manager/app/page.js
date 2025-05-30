"use client";

import {
  Button, TextField, Dialog, DialogActions, DialogContent,
  DialogTitle, Box, Snackbar, Alert, Typography
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import {
  collection, getDocs, doc, setDoc, deleteDoc
} from "firebase/firestore";

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
        email: email.trim() || ""
      });
      setSnackbar({ open: true, message: "Contact saved", severity: "success" });
      setOpen(false);
      setName(""); setPhone(""); setEmail("");
      loadContacts();
    } catch (error) {
      setSnackbar({ open: true, message: "Error saving contact", severity: "error" });
      console.error("Save error:", error);
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

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>Manage Contacts</Typography>

      {contacts.map(c => (
        <Box key={c.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
          <Typography><strong>{c.id}</strong></Typography>
          <Typography>📞 {c.phone}</Typography>
          <Typography>📧 {c.email || "—"}</Typography>
          <Button color="error" onClick={() => deleteContact(c.id)}>Delete</Button>
        </Box>
      ))}

      <Button
        variant="contained"
        startIcon={<Add />}
        onClick={() => setOpen(true)}
        sx={{ mt: 3 }}
      >
        Add Contact
      </Button>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add Contact</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Phone Number"
            fullWidth
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
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
  );
}
