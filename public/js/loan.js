// Load Loan Data on Page Load
window.onload = function() {
    fetch("/get-loan")
    .then(response => response.json())
    .then(data => {
        document.getElementById("amount").value = data.amount || 0;
        document.getElementById("rate").value = data.rate || 0;
        document.getElementById("tenure").value = data.tenure || 0;
        document.getElementById("emi").innerText = data.emi || 0;
    })
    .catch(error => console.error("Error fetching loan data:", error));
};

// Calculate EMI
function calculateEMI() {
    let amount = parseFloat(document.getElementById("amount").value) || 0;
    let rate = parseFloat(document.getElementById("rate").value) || 0;
    let tenure = parseFloat(document.getElementById("tenure").value) || 0;

    let monthlyRate = rate / 12 / 100;
    let emi = amount * monthlyRate * (Math.pow(1 + monthlyRate, tenure)) / (Math.pow(1 + monthlyRate, tenure) - 1);
    emi = emi.toFixed(2);

    document.getElementById("emi").innerText = isNaN(emi) ? "0" : emi;
}

// Save Loan Data to MySQL
function saveLoan() {
    let amount = parseFloat(document.getElementById("amount").value) || 0;
    let rate = parseFloat(document.getElementById("rate").value) || 0;
    let tenure = parseFloat(document.getElementById("tenure").value) || 0;
    let emi = document.getElementById("emi").innerText;

    fetch("/save-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, rate, tenure, emi })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error saving loan data:", error));
}