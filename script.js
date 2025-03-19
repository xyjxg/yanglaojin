document.getElementById('stockForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const stockCode = document.getElementById('stockCode').value; // 用户输入的股票代码
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
    // 解析股票代码
    let market, code;
    if (stockCode.startsWith('6')) {
        market = '1'; // 上海交易所
        code = stockCode;
    } else if (stockCode.startsWith('0') || stockCode.startsWith('3')) {
        market = '0'; // 深圳交易所
        code = stockCode;
    } else {
        console.error('不支持的股票代码格式');
        return Promise.resolve(0);
    }

    const secid = `${market}.${code}`; // 格式化为东方财富的secid
    const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43`;

    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const price = data.data.f43 / 100; // 价格需要除以100
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
