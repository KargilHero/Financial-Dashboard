async function fetchNews() {
    const url = 'https://newsapi.org/v2/everything?q=finance&apiKey=27f4cace5aed40e59be8aba8c5535dd4';
    const response = await fetch(url);
    const data = await response.json();
    return data.articles;
}

async function displayNews() {
    const articles = await fetchNews();
    const newsContainer = document.getElementById('news-container');
    newsContainer.innerHTML = articles.map(article => `
        <div class="news-article">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        </div>
    `).join('');
}

window.addEventListener("load", displayNews);
