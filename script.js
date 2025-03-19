document.getElementById('stockForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const stockCode = document.getElementById('stockCode').value.toUpperCase();
    const quantity = parseInt(document.getElementById('quantity').value);

    if (stockCode && quantity) {
        addStock(stockCode, quantity);
        document.getElementById('stockForm').reset();
    }
});

function addStock(stockCode, quantity) {
    fetchStockPrice(stockCode).then(price => {
        const marketValue = quantity * price;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${stockCode}</td>
            <td>${quantity}</td>
            <td>$${price.toFixed(2)}</td>
            <td>$${marketValue.toFixed(2)}</td>
        `;

        document.getElementById('stockTable').querySelector('tbody').appendChild(row);
        updateTotalValue();
    });
}

function fetchStockPrice(stockCode) {
    const apiKey = 'YOUR_API_KEY'; // 替换为你的Alpha Vantage API Key
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockCode}&apikey=${apiKey}`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const price = parseFloat(data['Global Quote']['05. price']);
            return price || 0; // 如果获取不到价格，返回0
        })
        .catch(error => {
            console.error('获取股票价格失败：', error);
            return 0;
        });
}

function updateTotalValue() {
    const rows = document.querySelectorAll('#stockTable tbody tr');
    let totalValue = 0;

    rows.forEach(row => {
        const marketValue = parseFloat(row.cells[3].textContent.replace('$', ''));
        totalValue += marketValue;
    });

    document.getElementById('totalValue').textContent = `$${totalValue.toFixed(2)}`;
}
