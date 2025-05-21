import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../../theme/ThemeContext';

// Animated icon button with a rotation effect when clicked
const AnimatedIconButton = styled(IconButton)(({ theme }) => ({
    transition: 'transform 0.3s ease-in-out',
    '&.rotating': {
        transform: 'rotate(180deg)',
    },
}));

export default function ColorModeToggle() {
    const [isAnimating, setIsAnimating] = useState(false);
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useThemeContext();

    const handleClick = () => {
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
            onClick={handleClick}
            color="inherit"
            className={isAnimating ? 'rotating' : ''}
            aria-label="toggle dark mode"
        >
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </AnimatedIconButton>
    );
} 