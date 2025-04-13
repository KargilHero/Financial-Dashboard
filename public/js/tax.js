function calculateTax() {
    const income = parseFloat(document.getElementById("income").value) || 0;
    const deductions = parseFloat(document.getElementById("deductions").value) || 0;
    const taxSlab = parseFloat(document.getElementById("taxSlab").value) || 0;

    const taxableIncome = income - deductions;
    const tax = (taxableIncome * taxSlab) / 100;
    document.getElementById("taxAmount").innerText = tax.toFixed(2);
}

function saveTax() {
    const income = document.getElementById("income").value;
    const deductions = document.getElementById("deductions").value;
    const taxSlab = document.getElementById("taxSlab").value;
    const tax = document.getElementById("taxAmount").innerText;

    fetch('/save-tax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ income, deductions, taxSlab, tax })
    }).then(response => response.json())
      .then(data => alert(data.message))
      .catch(error => alert("Error saving data"));
}
