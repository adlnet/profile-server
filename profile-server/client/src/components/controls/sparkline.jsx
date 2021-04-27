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
import { XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries, AreaSeries, Hint } from 'react-vis';
import { selectPattern } from '../../actions/patterns';

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
export default function Sparkline({ url, setCount, setDate }) {
  let [data, setData] = useState([]);
  useEffect(() => {
    let func = async function () {

      let _data = await api.getJSON("/app" + url);

      await setData(_data)
      setCountToTotal(_data);
    };
    func();
  }, [url])

  const setCountToTotal = async (knowndata) => {
    let values = knowndata || data;
    let count = values.reduce((p, c) => {

      return p + c.value;
    }, 0)

    await setCount(count);
  }

  if (!data) return ""
  return <XYPlot

    width={200}
    height={80}
    getX={d => d._id}
    getY={d => d.value}
    xType="time"
    onMouseLeave={() => { setCountToTotal(); setDate() }}
  >
    <AreaSeries
      color="none"
      fill="#e6b2fe"
      curve="curveNatural"
      onNearestX={(v, d) => { setCount(v.value); setDate(v._id) }}
      data={data} />
    <LineSeries
      color="#cc65fe"
      fill="none"
      curve="curveNatural"
      data={data} />

  </XYPlot>
}