import { jsx as _jsx } from "react/jsx-runtime";
export function ExperimentDecoyRibbon({ label = 'Popular' }) {
    return (_jsx("div", { style: {
            position: 'absolute',
            top: 10,
            right: -30,
            transform: 'rotate(45deg)',
            background: '#22c55e',
            color: '#fff',
            padding: '4px 40px',
            fontWeight: 700,
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }, children: label }));
}
