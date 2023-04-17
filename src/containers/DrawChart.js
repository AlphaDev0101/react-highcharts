import React, { Component } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import Hc3D from "highcharts/highcharts-3d";
import {
  HighchartsSparkline,
  withHighcharts,
  AreaSeries,
  // Tooltip,
} from "react-jsx-highcharts";

import { Table, Row, Col } from "antd";
Hc3D(Highcharts);

let defaultAlpha = 10;
let defaultBeta = 30;

function addEvents(H, chart) {
  function dragStart(eStart) {
    eStart = chart.pointer.normalize(eStart);

    var posX = eStart.chartX,
      posY = eStart.chartY,
      alpha = chart.options.chart.options3d.alpha,
      beta = chart.options.chart.options3d.beta,
      sensitivity = 5, // lower is more sensitive
      handlers = [];

    function drag(e) {
      // Get e.chartX and e.chartY
      e = chart.pointer.normalize(e);
      defaultAlpha = alpha + (e.chartY - posY) / sensitivity;
      defaultBeta = beta + (posX - e.chartX) / sensitivity;
      chart.update(
        {
          chart: {
            options3d: {
              alpha: defaultAlpha,
              beta: defaultBeta,
            },
          },
        },
        undefined,
        undefined,
        false
      );
    }

    function unbindAll() {
      handlers.forEach(function (unbind) {
        if (unbind) {
          unbind();
        }
      });
      handlers.length = 0;
    }

    handlers.push(H.addEvent(document, "mousemove", drag));
    handlers.push(H.addEvent(document, "touchmove", drag));

    handlers.push(H.addEvent(document, "mouseup", unbindAll));
    handlers.push(H.addEvent(document, "touchend", unbindAll));
  }
  H.addEvent(chart.container, "mousedown", dragStart);
  H.addEvent(chart.container, "touchstart", dragStart);
}

Highcharts.setOptions({
  colors: Highcharts.getOptions().colors.map(function (color) {
    return {
      radialGradient: {
        cx: 0.4,
        cy: 0.3,
        r: 0.5,
      },
      stops: [
        [0, color],
        [1, Highcharts.Color(color).brighten(-0.2).get("rgb")],
      ],
    };
  }),
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scatterData: [],
      selectedRowKeys: [],
      count: 0,
      activeRow: null,
    };
    this.renderSparkLineDefault = this.renderSparkLineDefault.bind(this);
  }

  renderSparkLineDefault(data) {
    return (
      <HighchartsSparkline
        series={
          <AreaSeries data={data} color="#32CD32" negativeColor="#C12127" />
        }
      />
    );
  }
  renderSparkLineBigger(data) {
    return (
      <HighchartsSparkline
        width={300}
        height={60}
        series={
          <AreaSeries data={data} color="#32CD32" negativeColor="#C12127" />
        }
      />
    );
  }

  render() {
    const {
      frequency,
      upper,
      lower,
      netProfit,
      totalTrades,
      profitFactor,
      profitability,
      sparkLineData,
      averageWinLoss,
      averageTrade,
      averageBars,
      strategyMaxDrawdown,
      profitPower,
      minRunUp,
      averageRunUp,
      maxRunUp,
      minDrawDown,
      averageDrawDown,
      maxDrawDown,
      isFilter,
      minFrequency,
      maxFrequency,
      minUpper,
      maxUpper,
      minLower,
      maxLower,
    } = this.props;
    if (
      !frequency ||
      !upper ||
      !lower ||
      !netProfit ||
      !totalTrades ||
      !profitFactor ||
      !profitability ||
      !sparkLineData ||
      !averageWinLoss ||
      !averageTrade ||
      !averageBars ||
      !strategyMaxDrawdown ||
      !profitPower ||
      !minRunUp ||
      !averageRunUp ||
      !maxRunUp ||
      !minDrawDown ||
      !averageDrawDown ||
      !maxDrawDown ||
      !minFrequency ||
      !maxFrequency ||
      !minUpper ||
      !maxUpper ||
      !minLower ||
      !maxLower
    )
      return null;

    const { count } = this.state;
    if (count + 1 === isFilter) {
      this.setState({ scatterData: [], selectedRowKeys: [] });
      this.setState({ count: count + 1 });
    }
    const { scatterData, selectedRowKeys, activeRow } = this.state;

    const chartOptions = {
      chart: {
        renderTo: "container",
        margin: 100,
        type: "scatter3d",
        animation: false,
        options3d: {
          enabled: true,
          alpha: defaultAlpha,
          beta: defaultBeta,
          depth: 250,
          viewDistance: 5,
          fitToPlot: false,
          frame: {
            bottom: { size: 1, color: "rgba(0,0,0,0.02)" },
            back: { size: 1, color: "rgba(0,0,0,0.04)" },
            side: { size: 1, color: "rgba(0,0,0,0.06)" },
          },
        },
      },
      title: {
        text: null,
      },
      plotOptions: {
        scatter: {
          width: 10,
          height: 10,
          depth: 10,
        },
      },
      yAxis: {
        min: minUpper,
        max: maxUpper,
        title: null,
      },
      xAxis: {
        min: minFrequency,
        max: maxFrequency,
        gridLineWidth: 1,
      },
      zAxis: {
        min: minLower,
        max: maxLower,
        showFirstLabel: false,
      },
      legend: {
        enabled: false,
      },
      tooltip: {
        formatter: function () {
          let x = this.point.options.x;
          let y = this.point.options.y;
          let z = this.point.options.z;
          let pf, net, trade;
          for (let i = 0; i < frequency.length; i++) {
            if (frequency[i] === x && upper[i] === y && lower[i] === z) {
              pf = profitFactor[i].toFixed(2);
              net = netProfit[i].toFixed(2);
              trade = totalTrades[i];
              break;
            }
          }
          if (net >= 1000) {
            let shortValue = parseFloat(
              (net / Math.pow(1000, 1)).toPrecision(2)
            );
            net = shortValue + "k";
          }
          if (net <= -1000) {
            net = Number.parseFloat(net).toExponential(2);
          }
          return `PF: ${pf} <br> Net: ${net} <br> Trade: ${trade} <br> Freq: ${x} <br> Upper: ${y} <br> Lower: ${z}`;
        },
      },
      series: [
        {
          name: "",
          colorByPoint: true,
          data: scatterData,
        },
      ],
    };

    const columns = [
      {
        title: "",
        dataIndex: "sparkLine",
        fixed: "left",
        width: "172px",
      },
      {
        title: "Frequency",
        dataIndex: "frequency",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.frequency - b.frequency,
      },
      {
        title: "Upper",
        dataIndex: "upper",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.upper - b.upper,
      },
      {
        title: "Lower",
        dataIndex: "lower",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.lower - b.lower,
      },
      {
        title: "Net Profit",
        dataIndex: "netProfit",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.netProfit - b.netProfit,
      },
      {
        title: "Total Trades",
        dataIndex: "totalTrades",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.totalTrades - b.totalTrades,
      },
      {
        title: "% Profitability",
        dataIndex: "profitability",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.profitability - b.profitability,
      },
      {
        title: "Profit Factor",
        dataIndex: "profitFactor",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.profitFactor - b.profitFactor,
      },
    ];

    const data = [];

    for (let i = 0; i < frequency.length; i++) {
      let temp = {};
      temp["key"] = `${i}`;
      temp["sparkLine"] = (
        <div>{this.renderSparkLineDefault(sparkLineData[i])}</div>
      );
      temp["frequency"] = frequency[i];
      temp["upper"] = upper[i];
      temp["lower"] = lower[i];
      temp["netProfit"] = netProfit[i].toFixed(2);
      temp["totalTrades"] = totalTrades[i];
      temp["profitability"] = profitability[i].toFixed(2);
      temp["profitFactor"] = profitFactor[i].toFixed(2);
      data.push(temp);
    }

    const onTableChange = (sorter) => {};

    const onSelectChange = (newSelectedRowKeys) => {
      let temp = [];
      newSelectedRowKeys.map((key) => {
        temp.push({ x: frequency[key], y: upper[key], z: lower[key] });
      });
      this.setState({
        selectedRowKeys: newSelectedRowKeys,
        scatterData: temp,
      });
    };

    const rowSelection = {
      selectedRowKeys,
      onChange: onSelectChange,
    };

    const expandedRowRender = (record) => (
      <Row gutter={16}>
        <Col className="gutter-row" span={9} style={{ margin: "auto" }}>
          {this.renderSparkLineBigger(sparkLineData[Number(record.key)])}
        </Col>
        <Col className="gutter-row" span={5}>
          <p>
            Average Win/Loss: {averageWinLoss[Number(record.key)].toFixed(2)}
          </p>
          <p>Average Trade: {averageTrade[Number(record.key)].toFixed(2)}</p>
          <p>Average Bars: {averageBars[Number(record.key)].toFixed(2)}</p>
          <p>
            Strategy Max Drawdown:{" "}
            {strategyMaxDrawdown[Number(record.key)].toFixed(2)}
          </p>
          <p>Profit Power: {profitPower[Number(record.key)].toFixed(2)}</p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p>Min Runup: {profitPower[Number(record.key)].toFixed(2)}</p>
          <p>
            Average Runup:{" "}
            {Number.parseFloat(averageRunUp[Number(record.key)]).toExponential(
              2
            )}
          </p>
          <p>
            Max Runup:{" "}
            {Number.parseFloat(maxRunUp[Number(record.key)]).toExponential(2)}
          </p>
        </Col>
        <Col className="gutter-row" span={5}>
          <p>
            Min Drawdown:{" "}
            {Number.parseFloat(minDrawDown[Number(record.key)]).toExponential(
              2
            )}
          </p>
          <p>
            Average Drawdown:{" "}
            {Number.parseFloat(
              averageDrawDown[Number(record.key)]
            ).toExponential(2)}
          </p>
          <p>
            Max Drawdown:{" "}
            {Number.parseFloat(maxDrawDown[Number(record.key)]).toExponential(
              2
            )}
          </p>
        </Col>
      </Row>
    );

    return (
      <div className="app">
        <div style={{ maxWidth: 800, margin: "auto" }}>
          <HighchartsReact
            highcharts={Highcharts}
            options={chartOptions}
            callback={function (chart) {
              addEvents(Highcharts, chart);
            }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          onChange={onTableChange}
          rowSelection={rowSelection}
          className="table table-striped"
          scroll={{ x: 700 }}
          expandRowByClick
          expandedRowRender={expandedRowRender}
          expandedRowKeys={activeRow}
          onExpand={(expanded, record) => {
            const keys = [];
            if (expanded) {
              keys.push(record.key);
            }
            this.setState({ activeRow: keys });
          }}
        />
      </div>
    );
  }
}

export default withHighcharts(App, Highcharts);
