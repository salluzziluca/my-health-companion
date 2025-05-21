import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../theme/ThemeContext';

// Simple icon button for navbar
const NavbarIconButton = styled(IconButton)(({ theme }) => ({
    transition: 'transform 0.3s ease-in-out',
    '&:active': {
        transform: 'rotate(180deg)',
    },
}));

export default function NavbarColorModeToggle() {
    const [isAnimating, setIsAnimating] = useState(false);
    const theme = useTheme();
    const { darkMode, toggleDarkMode } = useThemeContext();
    const isDarkMode = theme.palette.mode === 'dark';

    const handleToggle = () => {
        setIsAnimating(true);
        setTimeout(() => {
            toggleDarkMode();
            setTimeout(() => {
                setIsAnimating(false);
            }, 300);
        }, 150);
    };

    return (
        <NavbarIconButton
            onClick={handleToggle}
            color="inherit"
            disabled={isAnimating}
            size="large"
        >
            {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
        </NavbarIconButton>
    );
} 