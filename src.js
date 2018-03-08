/*chart基础配置*/
const canvas = document.getElementById('stock-canvas');
const ctx = canvas.getContext('2d');
let OkChartConfig = {
    padding: 30,
    originX: 30,
    originY: canvas.height - 30,
    width: canvas.width - (30 * 2),
    height: canvas.height - (30 * 2),
    dataSource: []
};

/*蜡烛图基础配置*/
let CandleConfig = {
    area: undefined,    //所占区域宽度
    width: undefined,   //K线宽度
    padding: undefined, //padding
    colorGreen: '#4db872',
    colorRed: '#ee6560'
};

// 设置chart配置
function setOkChartConfig(dataSource) {
    let minValue = 0;
    let maxValue = 0;
    dataSource.forEach((data)=>{
        if(data.high > maxValue) {
            maxValue = data.high;
        }
        if(data.low < minValue) {
            minValue = data.low
        }
    });
    OkChartConfig = {
        ...OkChartConfig,
        dataSource,
        maxValue,
        minValue,
        perValueHeight: OkChartConfig.height / (maxValue - minValue)  //单位(px/value)
    }
}

// 设置K线配置
function setCandleConfig() {
    const {dataSource, width} = OkChartConfig;
    const area = width / dataSource.length;
    const padding = area * 0.1;
    const candleWidth = area - (padding * 2);
    CandleConfig = {
        ...CandleConfig,
        area, padding,
        width: candleWidth
    }
}

function drawAxis() {
    const {originX, originY, width, padding} = OkChartConfig;
    // x轴
    drawLine(originX, originY, originX + width, originY);
    // y轴
    drawLine(originX, originY, originX, padding);
}

// 遍历数据画K线
function drawCandles() {
    OkChartConfig.dataSource.forEach((candle, index) => {
        const {originX} = OkChartConfig;
        //中心x坐标
        candle.xPosition = originX + ((index + 0.5) * CandleConfig.area);
        drawCandle(candle);
    });
}

// 画单个K线
function drawCandle(candle) {
    console.log(candle)
    const {open, close, high, low} = candle;
    const {originY, perValueHeight} = OkChartConfig;
    const {width, padding, colorGreen, colorRed} = CandleConfig;
    // 画矩形,x，y是矩形左上角坐标
    ctx.beginPath();
    const x = candle.xPosition - width / 2;
    const y = originY - (Math.max(open, close) * perValueHeight);
    const X = width;
    const Y = (Math.abs(close - open)) * perValueHeight;
    ctx.rect(x, y, X, Y);
    const color = close - open >= 0 ? colorGreen : colorRed;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
    // 画上、下影线
    const lineWidth = 2;
    const lineX = candle.xPosition - lineWidth / 2;
    const line1Y = originY - high * perValueHeight;
    const line1Length = y - line1Y;
    //上影线
    ctx.beginPath();
    ctx.rect(lineX, line1Y, lineWidth, line1Length);
    ctx.fill();
    ctx.closePath();
    //下影线
    const line2Y = originY - (Math.min(open, close) * perValueHeight);;
    const line2Length = originY - low * perValueHeight - line2Y;
    ctx.beginPath();
    ctx.rect(lineX, line2Y, lineWidth, line2Length);
    ctx.fill();
    ctx.closePath();
}

// 画线的方法,参数是起始坐标
function drawLine(x, y, X, Y) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(X, Y);
    ctx.stroke();
    ctx.closePath();
}

function init() {
    const dataSource = [{
        date: '01-01',
        open: 1,
        close: 2,
        high: 2.5,
        low: 0.5

    }, {
        date: '01-02',
        open: 1.5,
        close: 2.5,
        high: 3,
        low: 1.5
    }, {
        date: '01-03',
        open: 1,
        close: 3,
        high: 3,
        low: 0.5
    }, {
        date: '01-04',
        open: 3,
        close: 1,
        high: 5,
        low: 0.2
    }];
    setOkChartConfig(dataSource); // 设置图表
    setCandleConfig();      //设置K线
    drawAxis(); // 画坐标轴
    drawCandles(); //画K线
}

init();
