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
    // Replace with a real API call to get stock price
    // For demonstration, we'll use a mock price
    const mockPrices = {
        'AAPL': 150.00,
        'GOOGL': 2800.00,
        'TSLA': 700.00,
        'AMZN': 3400.00
    };

    return Promise.resolve(mockPrices[stockCode] || 0);
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
