
const API_URL = "http://localhost:5000";

const form = document.getElementById("inspectionForm");
const auditList = document.getElementById("auditList");
const message = document.getElementById("message");
const connectionStatus = document.getElementById("connectionStatus");
const pendingCount = document.getElementById("pendingCount");
const syncButton = document.getElementById("syncButton");

// Read saved audits from browser storage
function getAudits() {
    return JSON.parse(localStorage.getItem("inspections")) || [];
}

// Save audits in browser storage
function saveAudits(audits) {
    localStorage.setItem("inspections", JSON.stringify(audits));
}

// Update internet connection status
function updateConnectionStatus() {
    connectionStatus.textContent = navigator.onLine
        ? "Connection: Online"
        : "Connection: Offline";
}

// Display saved inspections
function displayAudits() {
    const audits = getAudits();

    pendingCount.textContent =
        "Pending audits: " + audits.filter(a => !a.synced).length;

    if (audits.length === 0) {
        auditList.innerHTML = "<p>No inspections saved yet.</p>";
        return;
    }

    auditList.innerHTML = audits.map(audit => `
        <div class="audit-item">
            <p><strong>Restaurant:</strong> ${escapeHTML(audit.restaurant)}</p>
            <p><strong>Inspector:</strong> ${escapeHTML(audit.inspector)}</p>
            <p><strong>Date:</strong> ${escapeHTML(audit.date)}</p>
            <p><strong>Result:</strong> ${escapeHTML(audit.status)}</p>
            <p><strong>Sync:</strong> ${audit.synced ? "Synced" : "Pending"}</p>
        </div>
    `).join("");
}

// Safely display user-entered text
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

// Save a new inspection locally
form.addEventListener("submit", function(event) {
    event.preventDefault();

    const audit = {
        id: crypto.randomUUID(),
        restaurant: document.getElementById("restaurant").value.trim(),
        inspector: document.getElementById("inspector").value.trim(),
        date: document.getElementById("date").value,
        observations: document.getElementById("observations").value.trim(),
        status: document.getElementById("status").value,
        synced: false
    };

    const audits = getAudits();
    audits.push(audit);
    saveAudits(audits);

    displayAudits();

    message.textContent = "Inspection saved successfully on this device!";
    message.style.color = "green";

    form.reset();
});

// Sync pending audits with the backend
syncButton.addEventListener("click", async function() {
    if (!navigator.onLine) {
        message.textContent = "You are offline. Audits remain saved locally.";
        message.style.color = "red";
        return;
    }

    const audits = getAudits();
    const pendingAudits = audits.filter(audit => !audit.synced);

    if (pendingAudits.length === 0) {
        message.textContent = "No pending audits to sync.";
        message.style.color = "green";
        return;
    }

    let syncedCount = 0;

    for (const audit of pendingAudits) {
        try {
            const response = await fetch(`${API_URL}/api/inspections`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(audit)
            });

            if (!response.ok) {
                throw new Error("Server rejected the audit");
            }

            audit.synced = true;
            syncedCount++;
            saveAudits(audits);
        } catch (error) {
            console.error("Sync failed:", error);
        }
    }

    displayAudits();

    message.textContent = `${syncedCount} audit(s) synchronized.`;
    message.style.color = syncedCount > 0 ? "green" : "red";
});

// Refresh connection status when network changes
window.addEventListener("online", updateConnectionStatus);
window.addEventListener("offline", updateConnectionStatus);

updateConnectionStatus();
displayAudits();
