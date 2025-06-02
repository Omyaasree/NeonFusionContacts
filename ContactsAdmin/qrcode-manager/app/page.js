"use client";

import {
  Box, Typography, TextField, Dialog, DialogActions,
  DialogContent, DialogTitle, Snackbar, Alert, Button, Avatar,
  Card, CardContent, CardActions, ThemeProvider, CssBaseline, createTheme
} from "@mui/material";
import {
  Contacts as ContactsIcon,
  Info as InfoIcon,
  Add as AddIcon,
  Edit as EditIcon
} from "@mui/icons-material";
import { amber, blueGrey, teal } from "@mui/material/colors";
import { useEffect, useState, useRef } from "react";
import { firestore } from "../firebase";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";

const theme = createTheme({
  palette: {
    mode: 'dark', // 🌙 Enables dark base mode for better neon contrast
    primary: {
      main: "#00FFFF",      // Neon Cyan
      light: "#66FFFF",
      dark: "#00CCCC"
    },
    secondary: {
      main: "#FF00FF",      // Neon Magenta
      light: "#FF66FF",
      dark: "#CC00CC"
    },
    background: {
      default: "#0d0d0d",   // Jet Black Background
      paper: "#1a1a1a"      // Dark Gray for cards
    },
    text: {
      primary: "#FFFFFF",   // Bright white text
      secondary: "#AAAAAA"  // Light gray secondary text
    }
  },
  typography: {
    fontFamily: "Segoe UI, Roboto, sans-serif",
    fontWeightBold: 700
  }
});

export default function AdminPage() {
  const [contacts, setContacts] = useState([]);
  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [showFlashcard, setShowFlashcard] = useState(true);
  const [excelDialog, setExcelDialog] = useState(false);
  const [startRow, setStartRow] = useState(2);
  const [endRow, setEndRow] = useState(10);
  const fileInputRef = useRef(null);

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
      const id = editMode ? currentId : name.trim();
      if (editMode && currentId !== name.trim()) {
        await deleteDoc(doc(firestore, "contacts", currentId));
      }
      await setDoc(doc(firestore, "contacts", id), {
        phone: formattedPhone,
        email: email.trim()
      });
      setSnackbar({ open: true, message: "Contact saved", severity: "success" });
      setOpen(false);
      setName(""); setPhone(""); setEmail("");
      setEditMode(false); setCurrentId("");
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();

    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      try {
        for (let i = startRow - 1; i <= endRow - 1 && i < rows.length; i++) {
          const row = rows[i];
          const name = row[0]?.toString().trim();
          const phone = row[1]?.toString().replace(/\D/g, "");
          const email = row[2]?.toString().trim();

          if (name && phone) {
            await setDoc(doc(firestore, "contacts", name), { phone, email });
          }
        }
        setSnackbar({ open: true, message: "Contacts imported from Excel", severity: "success" });
        loadContacts();
        setExcelDialog(false);
      } catch (err) {
        console.error(err);
        setSnackbar({ open: true, message: "Error importing Excel", severity: "error" });
      }
    };

    reader.readAsArrayBuffer(file);
  };

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
  <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
    {contacts.length === 0 ? (
      <Typography variant="body1" align="center" sx={{ py: 5 }}>
        No contacts yet.
      </Typography>
    ) : (
contacts.map(c => (
  <Box key={c.id} sx={{ mb: 2, p: 2, border: "1px solid #ccc", borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Avatar
        sx={{
          bgcolor: "#002B36",
          width: 50,
          height: 50,
          fontWeight: 800,
          fontSize: "1.8rem",
          color: "#00FFFF",
          textShadow: "0 0 6px #00FFFF, 0 0 10px #00FFFF"
        }}
      >
        {getInitials(c.id)}
      </Avatar>

      <Box>
        <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#000' }}>
          {c.id}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
          <span style={{ color: '#FF4081', fontSize: '1.2rem' }}>📞</span>
          <Typography variant="body2" sx={{ color: '#00CCAA', fontWeight: 500 }}>
            {c.phone}
          </Typography>
        </Box>

        {c.email && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <span style={{ color: '#7C4DFF', fontSize: '1.2rem' }}>📧</span>
            <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 500 }}>
              {c.email}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>

    <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
      <Button color="primary" startIcon={<EditIcon />} onClick={() => {
        setOpen(true);
        setEditMode(true);
        setCurrentId(c.id);
        setName(c.id);
        setPhone(c.phone);
        setEmail(c.email || "");
      }}>
        Edit
      </Button>
      <Button color="error" onClick={() => deleteContact(c.id)}>Delete</Button>
    </Box>
  </Box>
))

    )}
  </Box> {/* ✅ CLOSE THE SCROLLABLE BOX HERE */}
</CardContent>


<CardActions sx={{ p: 2, justifyContent: "center", gap: 2 }}>
  <Button
    variant="contained"
    startIcon={<AddIcon />}
    onClick={() => {
      setOpen(true);
      setEditMode(false);
      setCurrentId("");
      setName("");
      setPhone("");
      setEmail("");
    }}
  >
    Add Contact
  </Button>

  <Button
    variant="outlined"
    startIcon={<InfoIcon />}
    onClick={() => setExcelDialog(true)}
  >
    Import from Excel
  </Button>
</CardActions>

          </Card>
        </Box>

        {/* Manual Add Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>{editMode ? "Edit Contact" : "Add Contact"}</DialogTitle>
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

        {/* Snackbar */}
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

        {/* Flashcard Intro */}
        <Dialog open={showFlashcard} onClose={() => setShowFlashcard(false)}>
          <DialogTitle>Welcome</DialogTitle>
          <DialogContent>
            <Typography variant="body1" gutterBottom>Choose how you want to add contacts:</Typography>
            <Box display="flex" flexDirection="column" gap={2} mt={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  setShowFlashcard(false);
                  setExcelDialog(true);
                }}
              >
                📁 Import Excel
              </Button>
              <Button
                variant="outlined"
                onClick={() => {
                  setShowFlashcard(false);
                  setOpen(true);
                }}
              >
                ✍️ Add Manually
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* Excel Import Dialog */}
        <Dialog open={excelDialog} onClose={() => setExcelDialog(false)}>
          <DialogTitle>Import from Excel</DialogTitle>
          <DialogContent>
            <input type="file" accept=".xlsx, .xls" ref={fileInputRef} onChange={handleFileUpload} />
            <TextField label="Start Row" type="number" fullWidth margin="dense" value={startRow} onChange={(e) => setStartRow(Number(e.target.value))} />
            <TextField label="End Row" type="number" fullWidth margin="dense" value={endRow} onChange={(e) => setEndRow(Number(e.target.value))} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setExcelDialog(false)}>Cancel</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
