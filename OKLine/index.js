export default class OKLine {
    constructor(domId) {
        const canvas = document.getElementById(domId);
        this.canvas = canvas;
        this.overlayCanvas = document.getElementById()
        this.ctx = canvas.getContext('2d');
        // chart基础配置
        const defaultChartConfig = {
            padding: 30,
            originX: 30,
            originY: canvas.height - 30,
            width: canvas.width - (30 * 2),
            height: canvas.height - (30 * 2),
            dataSource: [],
            yAxis: {    // y轴相关配置
                maxDecimal: 1,      //最大精度，x位小数
                totalNumber: 10,    //Y轴刻度数量
                textMaxWidth: 80,   //Y轴文本最大宽度
            },
            xAxis: {    // x轴相关配置
                totalNumber: 3, //X轴刻度数量
                textMaxWidth: 80 //X轴文本最大宽度
            }
        };
        this.chartConfig = defaultChartConfig;
        // 蜡烛图基础配置
        const defaultCandleConfig = {
            area: undefined,    //所占区域宽度
            width: undefined,   //K线宽度
            padding: undefined, //padding
            colorGreen: '#4db872',
            colorRed: '#ee6560'
        };
        this.candleConfig = defaultCandleConfig;
        this._bindEvent();
    }

    /*
    * 设置数据源
    * 根据数据源画图
    * */
    setDataSource(dataSource) {
        this._clearCanvas();
        this.setChartConfig(dataSource); // 设置图表
        this.setCandleConfig();      //设置K线
        this.drawAxis(); // 画坐标轴
        this.drawMarkers(); //画标记
        this.drawCandles(); //画K线
    }

    /*
    * 根据dataSource设置chart配置
    * Y轴最大最小值，每个单位值的高度
    * */
    setChartConfig(dataSource) {
        let minValue;
        let maxValue;
        dataSource.forEach((data, index) => {
            if (index === 0) {
                minValue = data.low;
                maxValue = data.high;
            }
            if (data.high > maxValue) {
                maxValue = data.high;
            }
            if (data.low < minValue) {
                minValue = data.low
            }
        });
        const oldConfig = this.chartConfig;
        this.chartConfig = {
            ...oldConfig,
            dataSource,
            maxValue,
            minValue,
            oneValueHeight: parseInt(oldConfig.height / (maxValue - minValue))  //单位(px/value)
        }
    }

    //

    /*
    * 设置K线配置
    * 每根K线所占X轴区域，自身宽度，padding
    * */
    setCandleConfig() {
        const {dataSource, width} = this.chartConfig;
        const area = width / dataSource.length;
        const padding = area * 0.1;
        const candleWidth = area - (padding * 2);
        this.candleConfig = {
            ...this.candleConfig,
            area,
            padding,
            width: candleWidth
        }
    }

    /*
    * 画坐标轴
    * */
    drawAxis() {
        const {originX, originY, width, padding} = this.chartConfig;
        // x轴
        this._drawLine(originX, originY, originX + width, originY);
        // y轴
        this._drawLine(originX, originY, originX, padding);
    }

    /*
    * 画坐标轴上的标记
    * */
    drawMarkers() {
        const {ctx} = this;
        ctx.strokeStyle = "#E0E0E0";
        const {
            maxValue, minValue, height, width,
            originX, originY
        } = this.chartConfig;
        const {totalNumber, maxDecimal} = this.chartConfig.yAxis;
        // 绘制y轴标记
        const oneVal = (maxValue - minValue) / totalNumber;
        const oneHeight = parseInt(height / totalNumber);
        ctx.textAlign = "right";
        for (let i = 0; i <= totalNumber; i++) {
            const markerVal = (i * oneVal + minValue).toFixed(maxDecimal);
            const xPosition = originX - 10;
            const yPosition = originY - (oneHeight * i);

            ctx.fillText(markerVal, xPosition, yPosition); // 文字
            if (i > 0) {
                this._drawLine(originX + 2, yPosition, originX + width, yPosition);
            }
        }

        // 绘制 x
        //X轴目前不需要标记
    }

    /*
    * 遍历数据画K线
    * */
    drawCandles() {
        const {chartConfig, candleConfig} = this;
        chartConfig.dataSource.forEach((candle, index) => {
            const {originX} = chartConfig;
            //中心x坐标
            candle.xPosition = originX + ((index + 0.5) * candleConfig.area);
            this._drawCandle(candle);
        });
    }

    /*
    * 私有方法-画单个K线
    * */
    _drawCandle(candle) {
        const {open, close, high, low} = candle;
        const {originY, oneValueHeight} = this.chartConfig;
        const {width, colorGreen, colorRed} = this.candleConfig;
        const {ctx} = this;
        // 画矩形:x，y是矩形左上角坐标;X,Y是矩形宽高
        ctx.beginPath();
        const x = candle.xPosition - width / 2;
        const y = originY - (Math.max(open, close) * oneValueHeight);
        const X = width;
        const Y = close - open == 0 ? 2 : (Math.abs(close - open)) * oneValueHeight;
        ctx.rect(x, y, X, Y);
        const color = close - open >= 0 ? colorGreen : colorRed;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.closePath();
        // 画上、下影线
        const lineWidth = 2;
        const lineX = candle.xPosition - lineWidth / 2;
        const line1Y = originY - high * oneValueHeight;
        const line1Length = y - line1Y;
        //上影线
        ctx.beginPath();
        ctx.rect(lineX, line1Y, lineWidth, line1Length);
        ctx.fill();
        ctx.closePath();
        //下影线
        const line2Y = originY - (Math.min(open, close) * oneValueHeight);
        const line2Length = originY - low * oneValueHeight - line2Y;
        ctx.beginPath();
        ctx.rect(lineX, line2Y, lineWidth, line2Length);
        ctx.fill();
        ctx.closePath();
    }

    /*
    * 私有方法-画线,参数是起始坐标
    * */
    _drawLine(x, y, X, Y) {
        const {ctx} = this;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(X, Y);
        ctx.stroke();
        ctx.closePath();
    }

    /*
    * 私有方法-清空画布
    * */
    _clearCanvas() {
        const {canvas, ctx} = this;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    /*事件绑定*/
    _bindEvent() {
        this.canvas.addEventListener("mousemove", this._mouseMove.bind(this), false);
    }

    _mouseMove(e) {
        const {ctx} = this;
        const {width, originX} = this.chartConfig;
        const {pageX,pageY} = e;
        const {x,y} = this._getPointOnCanvas(pageX,pageY);
        const message = "MOVE 鼠标坐标：" + pageX + "," + pageY + " --canvas坐标："
            + this._getPointOnCanvas(pageX, pageY).x + "," + this._getPointOnCanvas(pageX, pageY).y;
        //console.log(message);
        ctx.strokeStyle = "#000";
        this._drawLine(originX,y,originX+width,y);
    }

    /*
    * 私有方法-获取鼠标相对canvas画布位置
    * */
    _getPointOnCanvas(x, y) {
        const {canvas} = this;
        const bbox = canvas.getBoundingClientRect();
        return {
            x: Math.round((x - bbox.left) * (canvas.width / bbox.width)),
            y: Math.round((y - bbox.top) * (canvas.height / bbox.height))
        };
    }
}





