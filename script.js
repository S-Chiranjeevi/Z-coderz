
const DB_NAME = "PatientDatabase";
const DB_VERSION = 5;
const STORE_PATIENTS = "patients";
const STORE_MOBILE = "mobileIndex";

let db = null;


function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(STORE_PATIENTS)) {
        d.createObjectStore(STORE_PATIENTS, { keyPath: "id" });
      }
      if (!d.objectStoreNames.contains(STORE_MOBILE)) {
        d.createObjectStore(STORE_MOBILE, { keyPath: "mobile" });
      }
    };

    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };

    req.onerror = (e) => {
      console.error("IndexedDB error:", e.target.error);
      reject(e.target.error);
    };
  });
}

function txStore(storeName, mode = "readonly") {
  if (!db) throw new Error("Database is not open");
  const tx = db.transaction(storeName, mode);
  return tx.objectStore(storeName);
}

function putPatient(patient) {
  return new Promise((res, rej) => {
    try {
      const store = txStore(STORE_PATIENTS, "readwrite");
      const r = store.put(patient);
      r.onsuccess = () => res(true);
      r.onerror = (e) => rej(e.target.error);
    } catch (err) {
      rej(err);
    }
  });
}

function putMobileMapping(mobile, id) {
  return new Promise((res, rej) => {
    try {
      const store = txStore(STORE_MOBILE, "readwrite");
      const r = store.put({ mobile, id });
      r.onsuccess = () => res(true);
      r.onerror = (e) => rej(e.target.error);
    } catch (err) {
      rej(err);
    }
  });
}

function getPatientById(id) {
  return new Promise((res, rej) => {
    try {
      const store = txStore(STORE_PATIENTS, "readonly");
      const r = store.get(id);
      r.onsuccess = () => res(r.result || null);
      r.onerror = (e) => rej(e.target.error);
    } catch (err) {
      rej(err);
    }
  });
}

function getMobileRecord(mobile) {
  return new Promise((res, rej) => {
    try {
      const store = txStore(STORE_MOBILE, "readonly");
      const r = store.get(mobile);
      r.onsuccess = () => res(r.result || null);
      r.onerror = (e) => rej(e.target.error);
    } catch (err) {
      rej(err);
    }
  });
}


function makeCandidateId() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

async function generateUniquePatientId(maxAttempts = 12) {
  for (let i = 0; i < maxAttempts; i++) {
    const candidate = makeCandidateId();
    const existing = await getPatientById(candidate);
    if (!existing) return candidate;
  }
  
  return Date.now().toString().slice(-12);
}

function show(elem) { if (elem) elem.classList.remove("hidden"); }
function hide(elem) { if (elem) elem.classList.add("hidden"); }

async function initApp() {
  try {
    await openDatabase();
  } catch (err) {
    console.error("DB open failed:", err);
    alert("Unable to open database. Check console.");
    return;
  }

  const searchType = document.getElementById("searchType");              
  const searchInputArea = document.getElementById("searchInputArea");   
  const searchLabel = document.getElementById("searchLabel");           
  const searchInput = document.getElementById("searchInput");           
  const searchForm = document.getElementById("searchForm");             

  if (searchInputArea) hide(searchInputArea);

  if (searchType) {
    searchType.addEventListener("change", () => {
      if (!searchType.value) {
        if (searchInputArea) hide(searchInputArea);
        return;
      }
      if (searchInputArea) show(searchInputArea);
      if (searchInput) searchInput.value = "";

      if (searchLabel) {
        if (searchType.value === "id") searchLabel.textContent = "Enter Patient ID:";
        else searchLabel.textContent = "Enter Mobile Number:";
      } else {
        if (searchInput) {
          searchInput.placeholder = searchType.value === "id" ? "Enter Patient ID" : "Enter Mobile Number";
        }
      }
    });
  }

  if (searchForm) {
    searchForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const type = searchType ? searchType.value : null;
      const val = searchInput ? (searchInput.value || "").trim() : "";

      if (!type) return alert("Please select search type first.");

      try {
        let patient = null;
        if (type === "id") {
          patient = await getPatientById(val);
          if (!patient) return alert("No patient found for that ID.");
        } else {
          if (!/^[6-9]\d{9}$/.test(val)) return alert("Enter a valid 10-digit mobile number.");
          const rec = await getMobileRecord(val);
          if (!rec) return alert("No patient found for that mobile number.");
          patient = await getPatientById(rec.id);
          if (!patient) return alert("Patient record missing.");
        }

        const enteredPassword = prompt("Enter patient password:");
        if (enteredPassword === null) return; // user cancelled
        if (!enteredPassword) return alert("Password required.");

        if (patient.password !== enteredPassword) {
          return alert("Incorrect password! Access denied.");
        }

        displayPatient(patient);

      } catch (err) {
        console.error("Search error:", err);
        alert("Search error. See console.");
      }
    });
  }

  const registerForm = document.getElementById("registerForm");
  const regNameEl = document.getElementById("regName");
  const regAgeEl = document.getElementById("regAge");
  const regGenderEl = document.getElementById("regGender");
  const regAllergiesEl = document.getElementById("regAllergies");
  const regMedicationsEl = document.getElementById("regMedications");
  const regMobileEl = document.getElementById("regMobile");
  const regPasswordEl = document.getElementById("regPassword");             
  const regConfirmPasswordEl = document.getElementById("regConfirmPassword");
  const mobileWarning = document.getElementById("mobileWarning");
  const newIdBox = document.getElementById("newIdBox");
  const generatedIdEl = document.getElementById("generatedId");

  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const name = regNameEl ? (regNameEl.value || "").trim() : "";
      const age = regAgeEl ? (regAgeEl.value || "").trim() : "";
      const gender = regGenderEl ? (regGenderEl.value || "").trim() : "";
      const allergies = regAllergiesEl ? (regAllergiesEl.value || "").trim() : "";
      const medications = regMedicationsEl ? (regMedicationsEl.value || "").trim() : "";
      const mobile = regMobileEl ? (regMobileEl.value || "").trim() : "";
      const password = regPasswordEl ? (regPasswordEl.value || "") : "";
      const confirm = regConfirmPasswordEl ? (regConfirmPasswordEl.value || "") : "";

      if (!name || !age) {
        return alert("Please enter at least Name and Age.");
      }

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        return alert("Enter a valid 10-digit mobile number.");
      }

      if (!password || !confirm) {
        return alert("Please enter and confirm the password.");
      }
      if (password !== confirm) {
        return alert("Passwords do not match.");
      }

      try {
        const existing = await getMobileRecord(mobile);
        if (existing) {
          if (mobileWarning) mobileWarning.style.display = "block";
          return;
        }
        if (mobileWarning) mobileWarning.style.display = "none";

        const newId = await generateUniquePatientId();

        const patient = {
          id: newId,
          name,
          age,
          gender,
          allergies,
          medications,
          mobile,
          password,   
          reports: "",
          scans: ""
        };

        
        await putPatient(patient);
        await putMobileMapping(mobile, newId);

        if (generatedIdEl) generatedIdEl.textContent = newId;
        if (newIdBox) show(newIdBox);

        registerForm.reset();

      } catch (err) {
        console.error("Registration error:", err);
        alert("Failed to register patient. See console.");
      }
    });
  }

  function displayPatient(patient) {
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val ?? "";
    };

    set("patientIdDisplay", patient.id);
    set("name", patient.name);
    set("age", patient.age);
    set("gender", patient.gender);
    set("allergies", patient.allergies);
    set("medications", patient.medications);
    set("reports", patient.reports || "No reports");
    set("scans", patient.scans || "No scans");

    const pd = document.getElementById("patientData");
    if (pd) show(pd);
  }
}


window.addEventListener("DOMContentLoaded", () => {
  initApp().catch((err) => console.error("initApp failed:", err));
});
