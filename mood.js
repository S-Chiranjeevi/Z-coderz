document.addEventListener("DOMContentLoaded", loadHistory);

function saveMood() {
    const mood = document.getElementById("mood").value;
    const note = document.getElementById("note").value;
    const date = new Date().toLocaleString();

    const entry = { mood, note, date };

    let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

    moodHistory.push(entry);

    localStorage.setItem("moodHistory", JSON.stringify(moodHistory));

    document.getElementById("note").value = "";

    loadHistory();
}

function loadHistory() {
    const historyContainer = document.getElementById("history");
    historyContainer.innerHTML = "";

    let moodHistory = JSON.parse(localStorage.getItem("moodHistory")) || [];

    moodHistory.forEach(entry => {
        const div = document.createElement("div");
        div.className = "history-item";

        div.innerHTML = `
            <strong>${entry.date}</strong><br>
            Mood: ${formatMood(entry.mood)}<br>
            ${entry.note ? "Note: " + entry.note : ""}
        `;

        historyContainer.appendChild(div);
    });
}

function formatMood(mood) {
    switch (mood) {
        case "happy": return "😊 Happy";
        case "okay": return "😐 Okay";
        case "sad": return "😔 Down";
        case "stressed": return "😣 Stressed";
        case "tired": return "😴 Tired";
        default: return mood;
    }
}
function clearData() {
    if (confirm("Are you sure you want to delete all mood data?")) {
        localStorage.removeItem("moodHistory");
        loadHistory();
        alert("All data cleared.");
    }
}