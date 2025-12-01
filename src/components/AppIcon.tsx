import React from 'react';
import { useTheme } from '@mui/material';

interface AppIconProps {
    size?: number;
    color?: string;
}

export default function AppIcon({ size = 40, color }: AppIconProps) {
    const theme = useTheme();
    const strokeColor = color || theme.palette.primary.main;

    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            stroke={strokeColor}
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect x="20" y="20" width="60" height="60" strokeWidth="5" />
            <line x1="50" y1="30" x2="50" y2="70" strokeWidth="6" />
        </svg>
    );
}
