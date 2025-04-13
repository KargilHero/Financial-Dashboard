async function fetchNews() {
    const url = 'https://newsdata.io/api/1/news?apikey=pub_71059bf9e70bd4692ab7e14a18b6601e3fa78&q=business&country=in&category=business';
    const response = await fetch(url);
    const data = await response.json();
    return data.results; // Adjusted key based on NewsData.io response structure
}

async function displayNews() {
    const articles = await fetchNews();
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = articles.map(article => `
        <div class="news-article">
            <h3>${article.title}</h3>
            <p>${article.description || 'No description available'}</p>
            <a href="${article.link}" target="_blank">Read more</a>
        </div>
    `).join('');
}

window.addEventListener("load", displayNews);
