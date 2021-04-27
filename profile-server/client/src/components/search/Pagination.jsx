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
**************************************************************** */import React, {useState} from "react";
import {Link} from "react-router-dom";

export default function Pagination(props)
{
    let total = Math.ceil(props.total);
    if(props.total <= 1) return "";
    let min = Math.max(0, props.current - 5);
    let max =Math.min(props.total, props.current + 5);
    let pages = [];
    for(let i = min; i < max; i++)
    {
        pages.push(i)
    }
return <div className = "usa-pagination">
    {props.current !== 0 && <div className="usa-page-link" onClick={()=>props.pageChanged(props.current - 1)}>Previous</div>}
    {pages.map(p=> <div className={"usa-page-link"+ (p == props.current ? " current" : "")} onClick={()=>props.pageChanged(p)}>{p+1}</div>)}
    {props.current < total -1 && <div className="usa-page-link" onClick={()=>props.pageChanged(props.current + 1)}>Next</div> }
</div>


}