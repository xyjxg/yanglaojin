// 从 localStorage 加载持仓数据
function loadPortfolio() {
    const portfolio = JSON.parse(localStorage.getItem('portfolio')) || [];
    portfolio.forEach(stock => {
        addStockToTable(stock.code, stock.quantity, stock.price);
    });
    updateTotalValue();
    startPriceUpdates(); // 启动价格更新
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
        <td><button onclick="deleteStock(this.parentElement.parentElement)">删除</button></td>
    `;

    document.getElementById('stockTable').querySelector('tbody').appendChild(row);
}

// 删除股票
function deleteStock(row) {
    row.remove();
    updateTotalValue();
    savePortfolio(); // 保存持仓数据
}

// 添加股票
function addStock(stockCode, quantity) {
    fetchStockPrice(stockCode).then(price => {
        if (price === 0) {
            alert('股票价格获取失败，请检查股票代码是否正确');
            return;
        }
        addStockToTable(stockCode, quantity, price);
        updateTotalValue();
        savePortfolio(); // 保存持仓数据
    });
}

function fetchStockPrice(stockCode) {
    // 判断是否为港股代码（以 HK 开头）
    if (stockCode.startsWith('HK')) {
        // 港股
        const code = stockCode.substring(2); // 去掉 HK 前缀
        const secid = `116.${code}`; // 港股市场代码为 116
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43`;

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                return response.json();
            })
            .then(data => {
                if (data.data && data.data.f43) {
                    const price = data.data.f43 / 100; // 价格需要除以100
                    return price || 0;
                } else {
                    console.error('未获取到港股价格数据');
                    return 0;
                }
            })
            .catch(error => {
                console.error('获取港股价格失败：', error);
                return 0;
            });
    } else if (/^[A-Za-z]+$/.test(stockCode)) {
        // 美股
        const secid = `105.${stockCode}`; // 美股市场代码为 105
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43`;

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                return response.json();
            })
            .then(data => {
                if (data.data && data.data.f43) {
                    const price = data.data.f43 / 100; // 价格需要除以100
                    return price || 0;
                } else {
                    console.error('未获取到美股价格数据');
                    return 0;
                }
            })
            .catch(error => {
                console.error('获取美股价格失败：', error);
                return 0;
            });
    } else {
        // A 股
        // 去掉股票代码前缀（SH/SZ）
        if (stockCode.startsWith('SH') || stockCode.startsWith('SZ')) {
            stockCode = stockCode.substring(2);
        }

        // 解析股票代码
        let market, code;
        if (stockCode.startsWith('6')) {
            market = '1'; // 上海交易所
            code = stockCode;
        } else if (stockCode.startsWith('0') || stockCode.startsWith('3')) {
            market = '0'; // 深圳交易所
            code = stockCode;
        } else {
            alert('不支持的股票代码格式');
            return Promise.resolve(0);
        }

        const secid = `${market}.${code}`; // 格式化为东方财富的secid
        const url = `https://push2.eastmoney.com/api/qt/stock/get?secid=${secid}&fields=f43`;

        return fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('网络请求失败');
                }
                return response.json();
            })
            .then(data => {
                if (data.data && data.data.f43) {
                    const price = data.data.f43 / 100; // 价格需要除以100
                    return price || 0;
                } else {
                    console.error('未获取到A股价格数据');
                    return 0;
                }
            })
            .catch(error => {
                console.error('获取A股价格失败：', error);
                return 0;
            });
    }
}

// 更新总市值
function updateTotalValue() {
    const rows = document.querySelectorAll('#stockTable tbody tr');
    let totalValue = 0;

    rows.forEach(row => {
        const marketValue = parseFloat(row.cells[3].textContent.replace('￥', ''));
        totalValue += marketValue;
    });

    // 更新总市值显示
    document.getElementById('totalValueDisplay').textContent = `￥${totalValue.toFixed(2)}`;
}

// 启动价格更新
function startPriceUpdates() {
    setInterval(() => {
        const rows = document.querySelectorAll('#stockTable tbody tr');
        rows.forEach(row => {
            const stockCode = row.cells[0].textContent;
            fetchStockPrice(stockCode).then(price => {
                if (price !== 0) {
                    const quantity = parseInt(row.cells[1].textContent);
                    const marketValue = quantity * price;
                    row.cells[2].textContent = `￥${price.toFixed(2)}`;
                    row.cells[3].textContent = `￥${marketValue.toFixed(2)}`;
                }
            });
        });
        updateTotalValue();
    }, 10000); // 每60秒更新一次
}

// 页面加载时加载持仓数据
window.onload = function() {
    loadPortfolio();
};

// 绑定表单提交事件
document.getElementById('stockForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const stockCode = document.getElementById('stockCode').value;
    const quantity = parseInt(document.getElementById('quantity').value);

    if (stockCode && quantity) {
        addStock(stockCode, quantity);
        document.getElementById('stockForm').reset();
    } else {
        alert('请填写股票代码和数量');
    }
});
