// Load Net Worth Data on Page Load
window.onload = function() {
    fetch("/get-networth")
    .then(response => response.json())
    .then(data => {
        document.getElementById("assets").value = data.assets || 0;
        document.getElementById("liabilities").value = data.liabilities || 0;
        document.getElementById("netWorth").innerText = data.netWorth || 0;
    })
    .catch(error => console.error("Error fetching net worth data:", error));
};

// Calculate Net Worth
function calculateNetWorth() {
    let assets = parseFloat(document.getElementById("assets").value) || 0;
    let liabilities = parseFloat(document.getElementById("liabilities").value) || 0;
    let netWorth = assets - liabilities;

    document.getElementById("netWorth").innerText = netWorth;
}

// Save to MySQL
function saveNetWorth() {
    let assets = parseFloat(document.getElementById("assets").value) || 0;
    let liabilities = parseFloat(document.getElementById("liabilities").value) || 0;
    let netWorth = assets - liabilities;

    fetch("/save-networth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assets, liabilities, netWorth })
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error("Error saving net worth:", error));
}
