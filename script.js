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
