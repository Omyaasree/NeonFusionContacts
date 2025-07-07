Got it! Here’s your **updated `README.md` snippet** with your clear usage notes woven in naturally under a new **📚 How to Use** section — so companies or teams know exactly how to handle the user flow and admin flow safely:

---

# 📇 **NeonFusionContacts**

**NeonFusionContacts** is a modern, dual-interface contact management system designed to make sharing and syncing important contact lists effortless — whether you’re an organization, club, or event host.

---

## ✨ **What Makes It Unique?**

* 🔗 **Admin & User Sides:**
  *Admins* securely manage a centralized contact list — while *users* can instantly view, select, and import contacts to their devices with one click.

* 📁 **Excel Bulk Upload:**
  Admins can upload an Excel file (name, phone, email) to add hundreds of contacts at once. No manual data entry, no errors.

* 🔒 **Realtime Firebase Sync:**
  Changes made on the admin side reflect immediately for all users via Firebase.

* 📲 **User-Friendly Export:**
  Users can choose specific contacts, auto-generate a `.vcf` file (vCard), and import directly to their phonebook.

* 🎨 **Modern, Responsive UI:**
  Built with React, Next.js, and MUI — works smoothly on mobile and desktop.

---

## 📚 **How to Use**

### ✅ **As a User**

* Scan the QR code shared with you.
* Carefully read the instructions at the top of the page.
* Click to select the contacts you want, then tap **“IMPORT TO CONTACTS.”**
* ⚠️ **Note:** Contacts with the same name may overwrite your existing saved contacts.
* Compatible with all newer iOS and Android models (except some Motorola phones, which may not support `.vcf` imports).

---

### 🛡️ **As an Admin**

* Use **“Import Excel”** to mass import contacts in seconds. The first column is the name, second is the phone, third is the email.
* You can also add, edit, or delete contacts manually — but **any action cannot be undone**. Updates can only be changed manually later.
* **All changes in the Admin Panel instantly sync** to the user side on refresh.
* ⚠️ The Admin Panel is connected to your live Firebase database and should be accessed **only by authorized personnel.**

---

## 🛠️ **Tech Stack**

* **Frontend:** Next.js 14, React, MUI
* **Backend:** Firebase Firestore
* **Bulk Upload:** XLSX.js for Excel parsing
* **Hosting:** Vercel

---

## 🚀 **Getting Started**

1. **Clone This Repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/neonfusioncontacts.git
   cd neonfusioncontacts
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Set Up Firebase**

   * Create a Firebase project.
   * Add your config in `.env.local`:

     ```env
     NEXT_PUBLIC_FIREBASE_API_KEY=...
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
     ...
     ```

4. **Run Locally**

   ```bash
   npm run dev
   ```

---

## 📌 **Contributing**

Open to suggestions, feature requests, or pull requests!
Feel free to fork & enhance it for your own use cases.

---

## 📝 **License**

MIT — use freely, build responsibly.
- by Omyaasree Balaji

---

