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
import { XYPlot, XAxis, YAxis, HorizontalGridLines, VerticalGridLines, LineSeries } from 'react-vis';

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
export default function Sparkline({ url }) {
  let [data, setData] = useState([]);
  useEffect(() => {
    let func = async function () {

      let _data = await api.getJSON("/app" + url);

      setData(_data)
    };
    func();
  }, [url])


  if (!data) return ""
  return <XYPlot

    width={200}
    height={80}
    getX={d => d._id}
    getY={d => d.value}
    xType="time"
    padding={30}
    style={{ width: "100%", height: "100%" }}
  >
    <LineSeries
      color="#0fbd66"
      fill="none"
      data={data} />

    
  </XYPlot>
}