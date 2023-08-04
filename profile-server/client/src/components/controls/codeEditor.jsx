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
import React from 'react';
import { useField, useFormikContext } from 'formik';

// https://github.com/securingsincity/react-ace/issues/725
import 'ace-builds';
import "ace-builds/webpack-resolver";

import AceEditor from 'react-ace';
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/src-noconflict/ext-language_tools"

export function CodeEditorField({ ...props }) {
    const [field, meta] = useField(props);
    const ctx = useFormikContext();

    return <AceEditor
        name={field.name}
        value={field.value}
        mode="json"
        theme="github"
        width="100%"
        showPrintMargin={false}
        onChange={value => ctx.setFieldValue(field.name, value)}
        editorProps={{ $blockScrolling: true }}
        {...props}
    />
}

export function CodeEditor({ readOnly = false, ...props }) {
    return <AceEditor
        mode="json"
        theme="github"
        width="100%"
        showPrintMargin={false}
        readOnly={readOnly}
        editorProps={{ $blockScrolling: Infinity }}
        {...props}
    />
}