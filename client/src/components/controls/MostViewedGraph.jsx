/** ***************************************************************
* Copyright 2020 Advanced Distributed Learning (ADL)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
**************************************************************** */
import React, { useState, useEffect } from 'react';
import api from '../../api';
import { Chart } from 'react-charts'
import { XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, VerticalBarSeries, Hint, LabelSeries } from 'react-vis';

let axes = [
  {
    primary: true,
    position: 'bottom',
    type: 'time',
    show: false
  },
  { position: 'left', type: 'linear', show: false }
];
let series = {
  showPoints: false
}
export default function MostViewedGraph(props) {
  let [data, setData] = useState([]);
  let [selected, setSelected] = useState();
  let [days, setDays] = useState("30");
  useEffect(() => {
    let func = async function () {

      let _data = await api.getJSON("/app/metrics/mostViewed?days=" + days);
      // names aren't unique
      _data = _data.map((i, j) => { i.x = i._id; return i });
      // console.log(_data);
      setData(_data)
    };
    func();
  }, ["days"])

  function forgetSelected() {
    setSelected(null);
  }
  async function _setDays(d) {
    let _data = await api.getJSON("/app/metrics/mostViewed?days=" + d);
    setDays(d);
    _data = _data.map((i, j) => { i.x = i._id; return i });

    setData(_data)
  }

  const axisStyle = {
    ticks: {
      fontSize: '12px',
      color: '#999'
    },
    title: {
      fontSize: '16px',
      color: '#333'
    }
  };

  if (!data) return ""
  // console.log(data.map(i=>i.name.substr(0,Math.min(15,i.name.length-1))))
  return <div className={"leadGraph " + (props.a ? "a" : "b")}>

    <div className="graphHead">
      <h3>Most Viewed {props.wide ? " Profiles" : ""} </h3>
      <select name="language" rows="3" className="usa-select" id="days" aria-required="true" value={days} onChange={(e) => _setDays(e.target.value)}><option value="30" disabled="">last 30 days</option><option value="365">last 12 months</option></select>
    </div>
    <XYPlot width={props.wide ? 880 : 440} height={props.wide ? 400 : 300} xType="ordinal">

      <HorizontalGridLines />



      <YAxis style={axisStyle}
        labelValues={[0, 1000]}
      />
      <XAxis
        tickFormat={v => {
          if (!props.wide) return ''
          let ret = data.find(d => d.x === v)
          return ret ? ret.name.substr(0, Math.min(15, ret.name.length)) : ''
        }}
      />

      <VerticalBarSeries
        onValueMouseOver={setSelected}
        onValueMouseOut={forgetSelected} data={data}
        color="rgba(204, 101, 254, 0.498039215686275)"
        style={{
          stroke: 'rgba(204, 101, 254, 1)',
          strokeLinejoin: 'round'
        }}
      />

      {selected ? (
        <Hint
          value={selected}
          align={{ horizontal: Hint.ALIGN.CENTER, vertical: Hint.ALIGN.CENTER }}
        >
          <div className="rv-hint__content">{`(${selected.name}, ${selected.y})`}</div>
        </Hint>
      ) : null}
    </XYPlot> </div>
}