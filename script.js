// 从 localStorage 加载持仓数据
function loadPortfolio() {
    const portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    portfolio.forEach(stock => {
        addStockToTable(stock.code, stock.quantity, stock.price);
    });
    updateTotalValue();
}

// 保存持仓数据到 localStorage
function savePortfolio() {
    const portfolio = [];
    document.querySelectorAll('#stockTable tbody tr').forEach(row => {
        const code = row.cells[0].textContent;
        const quantity = parseInt(row.cells[1].textContent);
        const price = parseFloat(row.cells[2].textContent.replace('￥', ''));
        portfolio.push({ code, quantity, price });
    });
    localStorage.setItem('portfolio', JSON.stringify(portfolio));
}

// 添加股票到表格
function addStockToTable(stockCode, quantity, price) {
    const marketValue = quantity * price;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${stockCode.toUpperCase()}</td>
        <td>${quantity}</td>
        <td>￥${price.toFixed(2)}</td>
        <td>￥${marketValue.toFixed(2)}</td>
    `;

    document.getElementById('stockTable').querySelector('tbody').appendChild(row);
}

// 添加股票
function addStock(stockCode, quantity) {
    fetchStockPrice(stockCode).then(price => {
        addStockToTable(stockCode, quantity, price);
        updateTotalValue();
        savePortfolio(); // 保存持仓数据
    });
}

// 更新总市值
function updateTotalValue() {
    const rows = document.querySelectorAll('#stockTable tbody tr');
    let totalValue = 0;

    rows.forEach(row => {
        const marketValue = parseFloat(row.cells[3].textContent.replace('￥', ''));
        totalValue += marketValue;
    });

    document.getElementById('totalValue').textContent = `￥${totalValue.toFixed(2)}`;
}

// 页面加载时加载持仓数据
window.onload = function() {
    loadPortfolio();
};

// 删除股票
function deleteStock(row) {
    row.remove();
    updateTotalValue();
    savePortfolio(); // 保存持仓数据
}

// 添加股票到表格
function addStockToTable(stockCode, quantity, price) {
    const marketValue = quantity * price;

    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${stockCode.toUpperCase()}</td>
        <td>${quantity}</td>
        <td>￥${price.toFixed(2)}</td>
        <td>￥${marketValue.toFixed(2)}</td>
        <td><button onclick="deleteStock(this.parentElement.parentElement)">删除</button></td>
    `;

    document.getElementById('stockTable').querySelector('tbody').appendChild(row);
}
