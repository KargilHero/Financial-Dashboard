const newsGrid = document.getElementById('newsGrid');

// Replace 'YOUR_API_KEY' with a valid NewsAPI key
const apiKey = '27f4cace5aed40e59be8aba8c5535dd4';
const apiUrl = `https://newsdata.io/api/1/news?apikey=pub_71059bf9e70bd4692ab7e14a18b6601e3fa78&q=business&country=in&category=business`;

async function fetchNews() {
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const articles = data.results.slice(0, 4); // Get top 4 articles
        displayNews(articles);
    } catch (error) {
        console.error('Error fetching news:', error);
        newsGrid.innerHTML = '<p>Failed to load news. Please try again later.</p>';
    }
}

function displayNews(articles) {
    newsGrid.innerHTML = articles.map(article => {
        return `
            <div class="news-item">
                <img src="${article.image_url || 'https://via.placeholder.com/300x200'}" alt="${article.title}">
                <div class="news-content">
                    <h3><a href="${article.link}" target="_blank">${article.title}</a></h3>
                    <p>${article.description || ''}</p>
                </div>
            </div>
        `;
    }).join('');
}

// Fetch and display the news on page load
window.addEventListener('load', fetchNews);


const stocksGrid = document.getElementById('stocksGrid');

// Replace 'YOUR_API_KEY' with your actual Alpha Vantage API key
const Key = 'LSB4G565QQO1GDSB';

// List of stock symbols to display
const stockSymbols = ['AAPL', 'TSLA', 'GOOGL', 'MSFT'];

async function fetchStockData(symbol) {
    const apiUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${Key}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log(data);
    return data['Global Quote'];
}

async function displayStocks() {
    for (const symbol of stockSymbols) {
        const stockData = await fetchStockData(symbol);
        const price = parseFloat(stockData['05. price']).toFixed(2);
        const change = parseFloat(stockData['09. change']).toFixed(2);
        const changePercent = parseFloat(stockData['10. change percent']).toFixed(2);

        const stockHTML = `
            <div class="stock-item">
                <h3>${symbol}</h3>
                <p>Price: $${price}</p>
                <p>Change: <span class="${change >= 0 ? 'positive' : 'negative'}">
                    ${change} (${changePercent}%)
                </span></p>
            </div>
        `;

        stocksGrid.innerHTML += stockHTML;
    }
}

const slider = document.querySelector('.testimonial-slider');
  const slides = document.querySelectorAll('.testimonial-card');
  let currentIndex = 0;

  function slideNext() {
    currentIndex = (currentIndex + 1) % slides.length;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  setInterval(slideNext, 4000); // Change every 4 seconds

// Fetch and display stocks on page load
window.addEventListener('load', displayStocks);



