document.getElementById('stockForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const stockCode = document.getElementById('stockCode').value.toLowerCase(); // 股票代码转为小写
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
            <td>${stockCode.toUpperCase()}</td>
            <td>${quantity}</td>
            <td>￥${price.toFixed(2)}</td>
            <td>￥${marketValue.toFixed(2)}</td>
        `;

        document.getElementById('stockTable').querySelector('tbody').appendChild(row);
        updateTotalValue();
    });
}

function fetchStockPrice(stockCode) {
    const url = `http://qt.gtimg.cn/q=${stockCode}`;

    return fetch(url)
        .then(response => response.text())
        .then(data => {
            // 解析返回的数据
            const fields = data.split('~');
            const price = parseFloat(fields[3]); // 当前价格在第4个字段
            return price || 0;
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
        const marketValue = parseFloat(row.cells[3].textContent.replace('￥', ''));
        totalValue += marketValue;
    });

    document.getElementById('totalValue').textContent = `￥${totalValue.toFixed(2)}`;
}
