import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../../theme/ThemeContext';

// Animated icon button with a rotation effect when clicked
const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
    position: 'fixed',
    top: '1rem',
    right: '1rem',
    zIndex: 1100,
    transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:active': {
        transform: 'rotate(180deg)',
    },
    '&.dark-mode': {
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(4px)',
        '&:hover': {
            background: 'rgba(255, 255, 255, 0.2)',
        },
    },
    '&.light-mode': {
        background: 'rgba(0, 0, 0, 0.05)',
        backdropFilter: 'blur(4px)',
        '&:hover': {
            background: 'rgba(0, 0, 0, 0.1)',
        },
    },
}));

// Animated icon with a fade and rotation effect
const AnimatedIcon = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.5s, opacity 0.3s',
    '&.fade-enter': {
        opacity: 0,
        transform: 'rotate(-90deg)',
    },
    '&.fade-enter-active': {
        opacity: 1,
        transform: 'rotate(0deg)',
    },
    '&.fade-exit': {
        opacity: 1,
        transform: 'rotate(0deg)',
    },
    '&.fade-exit-active': {
        opacity: 0,
        transform: 'rotate(90deg)',
    },
}));

export default function ColorModeToggle() {
    const [isAnimating, setIsAnimating] = useState(false);
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useThemeContext();
    const isDarkMode = theme.palette.mode === 'dark';

    const handleToggle = () => {
        setIsAnimating(true);
        // Delay the actual mode change to allow animation to complete
        setTimeout(() => {
            toggleDarkMode();
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }, 150);
    };

    return (
        <AnimatedIconButton
            onClick={handleToggle}
            color="inherit"
            className={isDarkMode ? 'dark-mode' : 'light-mode'}
            disabled={isAnimating}
        >
            <AnimatedIcon
                className={isAnimating ? (isDarkMode ? 'fade-exit fade-exit-active' : 'fade-enter fade-enter-active') : ''}
            >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </AnimatedIcon>
        </AnimatedIconButton>
    );
} 