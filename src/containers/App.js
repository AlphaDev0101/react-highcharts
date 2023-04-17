import React, { Component } from "react";
import { Button, Space, InputNumber } from "antd";
import { Row, Card, CardBody } from "reactstrap";
import { Colxx } from "../components/CustomBootstrap";
import PerfectScrollbar from "react-perfect-scrollbar";
import { NavLink } from "react-router-dom";
import "react-perfect-scrollbar/dist/css/styles.css";
import "../assets/css/vendor/bootstrap.min.css";
import "../assets/css/sass/themes/gogo.light.purple.scss";
import "../assets/css/vendor/dore.light.bluenavy.min.css";
import DrawChart from "./DrawChart";
import Papa from "papaparse";
import { UploadOutlined } from "@ant-design/icons";

import axios from "axios";

// const baseUrl = "http://localhost:3001/";

const csvData = axios("2_17_23_ZT.csv").then((res) => {
  const data = Papa.parse(res.data);
  return data;
});

const validateMessages = {
  required: "${label} is required!",
  number: {
    range: "${label} must be between ${min} and ${max}",
  },
};

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      csvData: csvData,
      frequency: null,
      upper: null,
      lower: null,
      netProfit: null,
      totalTrades: null,
      profitFactor: null,
      profitability: null,
      sparkLineData: null,
      averageWinLoss: null,
      averageTrade: null,
      averageBars: null,
      strategyMaxDrawdown: null,
      profitPower: null,
      minRunUp: null,
      averageRunUp: null,
      maxRunUp: null,
      minDrawDown: null,
      averageDrawDown: null,
      maxDrawDown: null,
      minFrequency: null,
      maxFrequency: null,
      minUpper: null,
      maxUpper: null,
      minLower: null,
      maxLower: null,
      minNetProfit: null,
      maxNetProfit: null,
      minTotalTrades: null,
      maxTotalTrades: null,
      minProfitFactor: null,
      maxProfitFactor: null,
      minProfitability: null,
      maxProfitability: null,
      initialValue: [],
      isFilter: 0,
      isLoading: true,
      showMenu: document.children[0].clientWidth > 728 ? true : false,
    };
    this.getData();
  }

  getMinMax(data) {
    let max = -Infinity;
    let min = Infinity;
    data.map((key) => {
      if (key > max) max = key;
      if (key < min) min = key;
    });

    return [min, max];
  }

  getData = () => {
    //Write API to get data.
    let csvData = this.state.csvData;
    csvData.then((result) => {
      let temp = result.data;
      let frequency = [];
      let upper = [];
      let lower = [];
      let netProfit = [];
      let totalTrades = [];
      let profitability = [];
      let profitFactor = [];
      let sparkLineData = [];
      let averageWinLoss = [];
      let averageTrade = [];
      let averageBars = [];
      let strategyMaxDrawdown = [];
      let profitPower = [];
      let minRunUp = [];
      let averageRunUp = [];
      let maxRunUp = [];
      let minDrawDown = [];
      let averageDrawDown = [];
      let maxDrawDown = [];
      for (let i = 1; i < temp.length - 1; i++) {
        frequency.push(Number(temp[i][1]));
        upper.push(Number(temp[i][2]));
        lower.push(Number(temp[i][3]));
        netProfit.push(Number(temp[i][4]));
        totalTrades.push(Number(temp[i][5]));
        profitability.push(Number(temp[i][6]) * 100);
        profitFactor.push(Number(temp[i][10]));
        let string = "";
        for (let j = 8; j < temp[i][19].length - 3; j++)
          string += temp[i][19][j];
        string = string.replace(/\s/g, "");
        let tempArray = string.split(",");
        let tempData = [];
        tempArray.map((num) => {
          tempData.push(Number(num));
        });
        sparkLineData.push(tempData);
        averageWinLoss.push(Number(temp[i][7]));
        averageTrade.push(Number(temp[i][8]));
        averageBars.push(Number(temp[i][9]));
        strategyMaxDrawdown.push(Number(temp[i][11]));
        profitPower.push(Number(temp[i][12]));
        minRunUp.push(Number(temp[i][13]));
        averageRunUp.push(Number(temp[i][14]));
        maxRunUp.push(Number(temp[i][15]));
        minDrawDown.push(Number(temp[i][16]));
        averageDrawDown.push(Number(temp[i][17]));
        maxDrawDown.push(Number(temp[i][18]));
      }
      this.setState({
        frequency: frequency,
        upper: upper,
        lower: lower,
        netProfit: netProfit,
        totalTrades: totalTrades,
        profitability: profitability,
        profitFactor: profitFactor,
        sparkLineData: sparkLineData,
        averageWinLoss: averageWinLoss,
        averageTrade: averageTrade,
        averageBars: averageBars,
        strategyMaxDrawdown: strategyMaxDrawdown,
        profitPower: profitPower,
        minRunUp: minRunUp,
        averageRunUp: averageRunUp,
        maxRunUp: maxRunUp,
        minDrawDown: minDrawDown,
        averageDrawDown: averageDrawDown,
        maxDrawDown: maxDrawDown,
      });
      let initialValue = [];
      initialValue.push(this.getMinMax(this.state.frequency)[0]);
      initialValue.push(this.getMinMax(this.state.frequency)[1]);
      initialValue.push(this.getMinMax(this.state.upper)[0]);
      initialValue.push(this.getMinMax(this.state.upper)[1]);
      initialValue.push(this.getMinMax(this.state.lower)[0]);
      initialValue.push(this.getMinMax(this.state.lower)[1]);
      initialValue.push(this.getMinMax(this.state.netProfit)[0].toFixed(2));
      initialValue.push(this.getMinMax(this.state.netProfit)[1].toFixed(2));
      initialValue.push(this.getMinMax(this.state.totalTrades)[0]);
      initialValue.push(this.getMinMax(this.state.totalTrades)[1]);
      initialValue.push(this.getMinMax(this.state.profitability)[0].toFixed(2));
      initialValue.push(this.getMinMax(this.state.profitability)[1].toFixed(2));
      initialValue.push(this.getMinMax(this.state.profitFactor)[0].toFixed(2));
      initialValue.push(this.getMinMax(this.state.profitFactor)[1].toFixed(2));
      this.setState({
        minFrequency: initialValue[0],
        maxFrequency: initialValue[1],
        minUpper: initialValue[2],
        maxUpper: initialValue[3],
        minLower: initialValue[4],
        maxLower: initialValue[5],
        minNetProfit: initialValue[6],
        maxNetProfit: initialValue[7],
        minTotalTrades: initialValue[8],
        maxTotalTrades: initialValue[9],
        minProfitability: initialValue[10],
        maxProfitability: initialValue[11],
        minProfitFactor: initialValue[12],
        maxProfitFactor: initialValue[13],
        initialValue: initialValue,
        isLoading: false,
      });
    });
  };

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
      minFrequency,
      maxFrequency,
      minUpper,
      maxUpper,
      minLower,
      maxLower,
      minNetProfit,
      maxNetProfit,
      minTotalTrades,
      maxTotalTrades,
      minProfitability,
      maxProfitability,
      minProfitFactor,
      maxProfitFactor,
      initialValue,
      isFilter,
      isLoading,
    } = this.state;

    const filterData = () => {
      let csvData = this.state.csvData;
      csvData.then((result) => {
        let temp = result.data;
        let frequency = [];
        let upper = [];
        let lower = [];
        let netProfit = [];
        let totalTrades = [];
        let profitability = [];
        let profitFactor = [];
        let sparkLineData = [];
        let averageWinLoss = [];
        let averageTrade = [];
        let averageBars = [];
        let strategyMaxDrawdown = [];
        let profitPower = [];
        let minRunUp = [];
        let averageRunUp = [];
        let maxRunUp = [];
        let minDrawDown = [];
        let averageDrawDown = [];
        let maxDrawDown = [];
        for (let i = 1; i < temp.length - 1; i++) {
          if (
            minFrequency <= Number(temp[i][1]) &&
            maxFrequency >= Number(temp[i][1]) &&
            minUpper <= Number(temp[i][2]) &&
            maxUpper >= Number(temp[i][2]) &&
            minLower <= Number(temp[i][3]) &&
            maxLower >= Number(temp[i][3]) &&
            minNetProfit <= Number(temp[i][4]) &&
            maxNetProfit >= Number(temp[i][4]) &&
            minTotalTrades <= Number(temp[i][5]) &&
            maxTotalTrades >= Number(temp[i][5]) &&
            minProfitability <= Number(temp[i][6]) * 100 &&
            maxProfitability >= Number(temp[i][6]) * 100 &&
            minProfitFactor <= Number(temp[i][10]) &&
            maxProfitFactor >= Number(temp[i][10])
          ) {
            frequency.push(Number(temp[i][1]));
            upper.push(Number(temp[i][2]));
            lower.push(Number(temp[i][3]));
            netProfit.push(Number(temp[i][4]));
            totalTrades.push(Number(temp[i][5]));
            profitability.push(Number(temp[i][6]) * 100);
            profitFactor.push(Number(temp[i][10]));
            let string = "";
            for (let j = 8; j < temp[i][19].length - 3; j++)
              string += temp[i][19][j];
            string = string.replace(/\s/g, "");
            let tempArray = string.split(",");
            let tempData = [];
            tempArray.map((num) => {
              tempData.push(Number(num));
            });
            sparkLineData.push(tempData);
            averageWinLoss.push(Number(temp[i][7]));
            averageTrade.push(Number(temp[i][8]));
            averageBars.push(Number(temp[i][9]));
            strategyMaxDrawdown.push(Number(temp[i][11]));
            profitPower.push(Number(temp[i][12]));
            minRunUp.push(Number(temp[i][13]));
            averageRunUp.push(Number(temp[i][14]));
            maxRunUp.push(Number(temp[i][15]));
            minDrawDown.push(Number(temp[i][16]));
            averageDrawDown.push(Number(temp[i][17]));
            maxDrawDown.push(Number(temp[i][18]));
          }
        }
        let count = isFilter;
        count++;
        this.setState({
          frequency: frequency,
          upper: upper,
          lower: lower,
          netProfit: netProfit,
          totalTrades: totalTrades,
          profitability: profitability,
          profitFactor: profitFactor,
          sparkLineData: sparkLineData,
          averageWinLoss: averageWinLoss,
          averageTrade: averageTrade,
          averageBars: averageBars,
          strategyMaxDrawdown: strategyMaxDrawdown,
          profitPower: profitPower,
          minRunUp: minRunUp,
          averageRunUp: averageRunUp,
          maxRunUp: maxRunUp,
          minDrawDown: minDrawDown,
          averageDrawDown: averageDrawDown,
          maxDrawDown: maxDrawDown,
          isFilter: count,
          isLoading: false,
        });
      });
    };

    const onChangeMinFrequency = (value) => {
      this.setState({ minFrequency: value });
    };

    const onChangeMaxFrequency = (value) => {
      this.setState({ maxFrequency: value });
    };

    const onChangeMinUpper = (value) => {
      this.setState({ minUpper: value });
    };

    const onChangeMaxUpper = (value) => {
      this.setState({ maxUpper: value });
    };

    const onChangeMinLower = (value) => {
      this.setState({ minLower: value });
    };

    const onChangeMaxLower = (value) => {
      this.setState({ maxLower: value });
    };

    const onChangeMinNetProfit = (value) => {
      this.setState({ minNetProfit: value });
    };

    const onChangeMaxNetProfit = (value) => {
      this.setState({ maxNetProfit: value });
    };

    const onChangeMinTotalTrades = (value) => {
      this.setState({ minTotalTrades: value });
    };

    const onChangeMaxTotalTrades = (value) => {
      this.setState({ maxTotalTrades: value });
    };

    const onChangeMinProfitability = (value) => {
      this.setState({ minProfitability: value });
    };

    const onChangeMaxProfitability = (value) => {
      this.setState({ maxProfitability: value });
    };

    const onChangeMinProfitFactor = (value) => {
      this.setState({ minProfitFactor: value });
    };

    const onChangeMaxProfitFactor = (value) => {
      this.setState({ maxProfitFactor: value });
    };

    return (
      <div id="app-container" className="menu-main-hidden ltr rounded">
        <div
          className="loading"
          style={{
            display: `${isLoading ? "block" : "none"}`,
          }}
        />
        <nav className="navbar fixed-top">
          <NavLink
            to="#"
            className="menu-button d-none d-md-block"
            onClick={() => {
              let temp = this.state.showMenu;
              this.setState({ showMenu: !temp });
            }}
          >
            <svg
              className="main"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 9 17"
            >
              <rect x="0.48" y="0.5" width="7" height="1" />
              <rect x="0.48" y="7.5" width="7" height="1" />
              <rect x="0.48" y="15.5" width="7" height="1" />
            </svg>
            <svg
              className="sub"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 18 17"
            >
              <rect x="1.56" y="0.5" width="16" height="1" />
              <rect x="1.56" y="7.5" width="16" height="1" />
              <rect x="1.56" y="15.5" width="16" height="1" />
            </svg>
          </NavLink>
          <NavLink
            to="#"
            className="menu-button-mobile d-xs-block d-sm-block d-md-none"
            onClick={() => {
              let temp = this.state.showMenu;
              this.setState({ showMenu: !temp });
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 17">
              <rect x="0.5" y="0.5" width="25" height="1" />
              <rect x="0.5" y="7.5" width="25" height="1" />
              <rect x="0.5" y="15.5" width="25" height="1" />
            </svg>
          </NavLink>
          <h1 style={{ margin: "auto" }}>The Chart of Profit</h1>
        </nav>
        <div className="menu default-transition">
          <div
            className="sub-menu default-transition scroll"
            style={{
              width: 300,
              display: `${this.state.showMenu ? "block" : "none"}`,
            }}
          >
            <PerfectScrollbar
              option={{ suppressScrollX: true, wheelPropagation: false }}
            >
              <div id="upload" style={{ textAlign: "center", marginTop: 32 }}>
                <input
                  id="uploadFile"
                  type="file"
                  accept=".csv"
                  style={{ display: "none" }}
                />
                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  icon={<UploadOutlined />}
                  danger
                  onClick={() => document.getElementById("uploadFile").click()}
                >
                  Upload CSV File
                </Button>
              </div>
              <div id="filter" style={{ marginTop: 24 }}>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Frequency(Range: {initialValue[0]}~{initialValue[1]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minFrequency"
                      addonAfter="min"
                      min={initialValue[0]}
                      max={initialValue[1]}
                      value={minFrequency}
                      onChange={onChangeMinFrequency}
                    />
                    <InputNumber
                      id="maxFrequency"
                      addonAfter="max"
                      min={initialValue[0]}
                      max={initialValue[1]}
                      value={maxFrequency}
                      onChange={onChangeMaxFrequency}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Upper(Range: {initialValue[2]}~{initialValue[3]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minUpper"
                      addonAfter="min"
                      min={initialValue[2]}
                      max={initialValue[3]}
                      value={minUpper}
                      onChange={onChangeMinUpper}
                    />
                    <InputNumber
                      id="maxUpper"
                      addonAfter="max"
                      min={initialValue[2]}
                      max={initialValue[3]}
                      value={maxUpper}
                      onChange={onChangeMaxUpper}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Lower(Range: {initialValue[4]}~{initialValue[5]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minLower"
                      addonAfter="min"
                      min={initialValue[4]}
                      max={initialValue[5]}
                      value={minLower}
                      onChange={onChangeMinLower}
                    />
                    <InputNumber
                      id="maxLower"
                      addonAfter="max"
                      min={initialValue[4]}
                      max={initialValue[5]}
                      value={maxLower}
                      onChange={onChangeMaxLower}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Net Profit(Range: {initialValue[6]}~{initialValue[7]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minNetProfit"
                      addonAfter="min"
                      min={initialValue[6]}
                      max={initialValue[7]}
                      value={minNetProfit}
                      onChange={onChangeMinNetProfit}
                    />
                    <InputNumber
                      id="maxNetProfit"
                      addonAfter="max"
                      min={initialValue[6]}
                      max={initialValue[7]}
                      value={maxNetProfit}
                      onChange={onChangeMaxNetProfit}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Total Trades(Range: {initialValue[8]}~{initialValue[9]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minTotalTrades"
                      addonAfter="min"
                      min={initialValue[8]}
                      max={initialValue[9]}
                      value={minTotalTrades}
                      onChange={onChangeMinTotalTrades}
                    />
                    <InputNumber
                      id="maxTotalTrades"
                      addonAfter="max"
                      min={initialValue[8]}
                      max={initialValue[9]}
                      value={maxTotalTrades}
                      onChange={onChangeMaxTotalTrades}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Profitability(Range: {initialValue[10]}~{initialValue[11]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minProfitability"
                      addonAfter="min"
                      min={initialValue[10]}
                      max={initialValue[11]}
                      value={minProfitability}
                      onChange={onChangeMinProfitability}
                    />
                    <InputNumber
                      id="maxProfitability"
                      addonAfter="max"
                      min={initialValue[10]}
                      max={initialValue[11]}
                      value={maxProfitability}
                      onChange={onChangeMaxProfitability}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <h4>
                    Profit Factor(Range: {initialValue[12]}~{initialValue[13]})
                  </h4>
                  <Space>
                    <InputNumber
                      id="minProfitFactor"
                      addonAfter="min"
                      min={initialValue[12]}
                      max={initialValue[13]}
                      value={minProfitFactor}
                      onChange={onChangeMinProfitFactor}
                    />
                    <InputNumber
                      id="maxProfitFactor"
                      addonAfter="max"
                      min={initialValue[12]}
                      max={initialValue[13]}
                      value={maxProfitFactor}
                      onChange={onChangeMaxProfitFactor}
                    />
                  </Space>
                </Row>
                <Row
                  style={{ maxWidth: 250, margin: "auto", marginBottom: 24 }}
                >
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={() => {
                        // this.state({ isLoading: true });
                        filterData();
                      }}
                    >
                      Filter
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      onClick={() => {
                        // this.setState({ isLoading: true });
                        this.getData();
                        let count = isFilter;
                        count++;
                        this.setState({ isFilter: count });
                      }}
                    >
                      Reset
                    </Button>
                  </Space>
                </Row>
              </div>
            </PerfectScrollbar>
          </div>
        </div>
        <main>
          <div id="charts">
            <Row>
              <Colxx
                lg="12"
                xl="10"
                className="mb-6"
                style={{ margin: "auto" }}
              >
                <Card>
                  <CardBody>
                    <h2>Profits</h2>
                    <DrawChart
                      frequency={frequency}
                      upper={upper}
                      lower={lower}
                      netProfit={netProfit}
                      totalTrades={totalTrades}
                      profitFactor={profitFactor}
                      profitability={profitability}
                      sparkLineData={sparkLineData}
                      averageWinLoss={averageWinLoss}
                      averageTrade={averageTrade}
                      averageBars={averageBars}
                      strategyMaxDrawdown={strategyMaxDrawdown}
                      profitPower={profitPower}
                      minRunUp={minRunUp}
                      averageRunUp={averageRunUp}
                      maxRunUp={maxRunUp}
                      minDrawDown={minDrawDown}
                      averageDrawDown={averageDrawDown}
                      maxDrawDown={maxDrawDown}
                      isFilter={isFilter}
                      minFrequency={minFrequency}
                      maxFrequency={maxFrequency}
                      minUpper={minUpper}
                      maxUpper={maxUpper}
                      minLower={minLower}
                      maxLower={maxLower}
                    />
                  </CardBody>
                </Card>
              </Colxx>
            </Row>
          </div>
        </main>
      </div>
    );
  }
}

export default App;
