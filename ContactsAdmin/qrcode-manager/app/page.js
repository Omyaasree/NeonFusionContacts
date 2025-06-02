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
import { useEffect, useState } from "react";
import { firestore } from "../firebase";
import { collection, getDocs, setDoc, deleteDoc, doc } from "firebase/firestore";
import * as XLSX from "xlsx";

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
 const [editMode, setEditMode] = useState(false);
 const [currentId, setCurrentId] = useState("");
 const [name, setName] = useState("");
 const [phone, setPhone] = useState("");
 const [email, setEmail] = useState("");
 const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
 const [showFlashcard, setShowFlashcard] = useState(true);

 useEffect(() => { loadContacts(); }, []);

 const loadContacts = async () => {
  const snapshot = await getDocs(collection(firestore, "contacts"));
  const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

 const handleExcelUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
   const data = new Uint8Array(e.target.result);
   const workbook = XLSX.read(data, { type: "array" });
   const sheet = workbook.Sheets[workbook.SheetNames[0]];
   const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

   let success = 0, skipped = 0;
   for (let i = 0; i < rows.length; i++) {
    const [name, phone, email] = rows[i].map(c => c?.toString().trim());
    if (!name || !phone) {
     skipped++;
     continue;
    }
    try {
     await setDoc(doc(firestore, "contacts", name), {
      phone: phone.replace(/\D/g, ""),
      email: email || ""
     });
     success++;
    } catch (e) {
     console.error("Error importing row", i, e);
     skipped++;
    }
   }
   loadContacts();
   setSnackbar({
    open: true,
    message: `Imported ${success} contacts, skipped ${skipped}`,
    severity: "success"
   });
  };
  reader.readAsArrayBuffer(file);
 };

 const getInitials = (name) => name.split(" ").map(w => w[0]).join("").toUpperCase().substring(0, 2);

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
        <Typography variant="body1" align="center" sx={{ py: 5 }}>No contacts yet.</Typography>
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
      </CardContent>

      <CardActions sx={{ p: 2, justifyContent: "center" }}>
       <Button variant="contained" startIcon={<AddIcon />} onClick={() => {
        setOpen(true);
        setEditMode(false);
        setCurrentId("");
        setName("");
        setPhone("");
        setEmail("");
       }}>Add Contact</Button>
       <Button variant="outlined" component="label">
        📁 Import Excel
        <input type="file" accept=".xlsx,.xls" hidden onChange={handleExcelUpload} />
       </Button>
      </CardActions>
     </Card>
    </Box>

    {/* Contact Dialog */}
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
