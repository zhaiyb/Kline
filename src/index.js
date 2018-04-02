import OKLine from '../OKLine';

const okChart = new OKLine('kline');

function init() {
    let dataSource = [];
    for (var i = 0; i < 9; i++) {
        dataSource.push(getDataUnit());
    }
    okChart.setDataSource(dataSource);
    /*setInterval(() => {
        const currDataUnit = dataSource[dataSource.length - 1];
        currDataUnit.close = Math.max(currDataUnit.close - 0.1, 0);
        currDataUnit.low = Math.max(currDataUnit.low - 0.1, 0);

        okChart.setDataSource(dataSource);
    }, 500);*/
}

init();

function getDataUnit() {
    const open = getRandom();
    const close = getRandom();
    const high = Math.max(getRandom(), open, close);
    const low = Math.min(getRandom(), open, close);
    const dataUnit = {
        open,
        close,
        high,
        low,
    };
    return dataUnit;
}

function getRandom() {
    return Number((Math.random() * 10).toFixed(2));
}