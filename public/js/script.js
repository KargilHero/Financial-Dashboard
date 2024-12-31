const stockPriceContainer = document.querySelector('.stock-price-container');
const stockSearchForm = document.querySelector('#stock-search-form');
const stockSearchInput = document.querySelector('#stock-search-input');
const suggestionsContainer = document.createElement('ul'); // Create a UL for suggestions
suggestionsContainer.classList.add('suggestions'); // Add class for styling
stockSearchForm.appendChild(suggestionsContainer); // Append it to the form
let stockChart = null; // Declare the chart globally

// Function to fetch stock data based on user input (stock symbol)
async function fetchStockData(symbol) {
    const apiKey = 'c8f53a62b379431b849366d053d62b0d'; // Replace with your Twelve Data API key
    const url = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=5min&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.values) {
            const timeSeries = data.values;
            displayStockData(timeSeries, symbol);
            createStockChart(timeSeries, symbol);
        } else {
            stockPriceContainer.innerHTML = `<p>Invalid stock symbol or API limit reached. Try again later.</p>`;
        }
    } catch (error) {
        console.error("Error fetching stock data:", error);
        stockPriceContainer.innerHTML = `<p>Error fetching stock data. Please try again later.</p>`;
    }
}

// Function to fetch ticker symbol based on company name
async function fetchTickerSymbol(companyName) {
    const apiKey = 'xV25GYYG5aVhK6Nr4HbR53nAGNHb4k3A'; // Replace with your Financial Modeling Prep API key
    const url = `https://financialmodelingprep.com/api/v3/search?query=${companyName}&limit=10&exchange=NASDAQ&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            return data[0].symbol; // Return the first matching ticker symbol
        } else {
            return null; // No symbol found
        }
    } catch (error) {
        console.error("Error fetching ticker symbol:", error);
        return null; // Return null on error
    }
}

// Function to fetch company name based on ticker symbol
async function fetchCompanyName(symbol) {
    const apiKey = 'xV25GYYG5aVhK6Nr4HbR53nAGNHb4k3A'; // Replace with your Financial Modeling Prep API key
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.length > 0) {
            return data[0].companyName; // Return the company name
        } else {
            return null; // No company found
        }
    } catch (error) {
        console.error("Error fetching company name:", error);
        return null; // Return null on error
    }
}

// Function to display stock data with company name
async function displayStockData(stockData, symbol) {
    stockPriceContainer.innerHTML = ''; // Clear previous data
    const latestData = stockData[0]; // Get the latest data point

    // Fetch the company name
    const companyName = await fetchCompanyName(symbol);

    // Create HTML with company name
    const stockHTML = `
        <h3>Stock: ${symbol.toUpperCase()}</h3>
        <p>Company: ${companyName ? companyName : 'N/A'}</p> <!-- Added company name here -->
        <p>Date/Time: ${latestData.datetime}</p>
        <p>Open: ${latestData.open}</p>
        <p>High: ${latestData.high}</p>
        <p>Low: ${latestData.low}</p>
        <p>Close: ${latestData.close}</p>
        <p>Volume: ${latestData.volume}</p>
    `;

    stockPriceContainer.innerHTML = stockHTML;
}

// Function to create the stock chart using Chart.js
function createStockChart(stockData, symbol) {
    const labels = stockData.map(data => data.datetime).reverse(); // Time labels
    const closingPrices = stockData.map(data => data.close).reverse(); // Closing prices

    // Remove previous chart if it exists
    if (stockChart !== null) {
        stockChart.destroy();
    }

    // Get the canvas element for the graph
    const ctx = document.getElementById('stockChart').getContext('2d');

    // Create a new chart
    stockChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels, // X-axis labels (time)
            datasets: [{
                label: `Closing Prices for ${symbol.toUpperCase()}`,
                data: closingPrices, // Y-axis data (stock prices)
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Time'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (USD)'
                    },
                    beginAtZero: false
                }
            }
        }
    });
}

// Add event listener for stock search form submission
stockSearchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    let searchInput = stockSearchInput.value.trim();

    if (searchInput) {
        let symbol = searchInput.toUpperCase(); // Assume it's a symbol first

        // Try fetching stock data based on symbol
        let companyName = await fetchCompanyName(symbol);
        if (!companyName) { // If not found, treat it as a company name and fetch symbol
            symbol = await fetchTickerSymbol(searchInput);
            if (!symbol) {
                stockPriceContainer.innerHTML = `<p>No matching stock or company found. Please try again.</p>`;
                return;
            }
        }

        // Fetch stock data using the symbol
        fetchStockData(symbol);
    }
});

// Add event listener for input to fetch company names and display suggestions
stockSearchInput.addEventListener('input', async () => {
    const searchInput = stockSearchInput.value.trim();
    suggestionsContainer.innerHTML = ''; // Clear previous suggestions

    if (searchInput) {
        const symbol = await fetchTickerSymbol(searchInput);
        if (symbol) {
            const companyName = await fetchCompanyName(symbol);
            const suggestionItem = document.createElement('li');
            suggestionItem.textContent = `${symbol.toUpperCase()} - ${companyName}`;
            suggestionItem.onclick = () => {
                stockSearchInput.value = symbol; // Set input value to the clicked suggestion
                suggestionsContainer.innerHTML = ''; // Clear suggestions
                fetchStockData(symbol); // Fetch stock data
            };
            suggestionsContainer.appendChild(suggestionItem);
        }
    }

    // Show or hide suggestions based on the input
    if (suggestionsContainer.children.length > 0) {
        suggestionsContainer.style.display = 'block'; // Show suggestions
    } else {
        suggestionsContainer.style.display = 'none'; // Hide suggestions
    }
});

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!stockSearchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.style.display = 'none'; // Hide suggestions
    }
});
