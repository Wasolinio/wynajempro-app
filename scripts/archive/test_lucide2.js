import { renderToString } from 'react-dom/server';
import { XCircle } from 'lucide-react';
import React from 'react';
console.log(renderToString(React.createElement(XCircle)));
