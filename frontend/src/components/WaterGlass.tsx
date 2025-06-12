import React from 'react';
import { Box, Typography, IconButton, LinearProgress } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

interface WaterGlassProps {
    currentMl: number;
    targetMl: number;
    onAddWater: () => void;
    disabled?: boolean;
}

const WaterGlass: React.FC<WaterGlassProps> = ({
    currentMl,
    targetMl,
    onAddWater,
    disabled = false
}) => {
    const percentage = Math.min((currentMl / targetMl) * 100, 100);
    const isGoalAchieved = currentMl >= targetMl;

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 2
        }}>
            {/* Vaso de agua */}
            <Box
                sx={{
                    position: 'relative',
                    width: 80,
                    height: 120,
                    border: '3px solid #2196f3',
                    borderRadius: '0 0 20px 20px',
                    borderTop: 'none',
                    background: 'linear-gradient(to top, #e3f2fd 0%, #bbdefb 100%)',
                    overflow: 'hidden',
                    mb: 2,
                    cursor: disabled ? 'default' : 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': disabled ? {} : {
                        transform: 'scale(1.05)'
                    }
                }}
                onClick={disabled ? undefined : onAddWater}
            >
                {/* Agua dentro del vaso */}
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: `${percentage}%`,
                        background: isGoalAchieved
                            ? 'linear-gradient(to top, #4caf50, #81c784)'
                            : 'linear-gradient(to top, #2196f3, #64b5f6)',
                        transition: 'height 0.8s ease-in-out',
                        borderRadius: '0 0 17px 17px',
                    }}
                />

                {/* Líneas de medición */}
                {[25, 50, 75].map((mark) => (
                    <Box
                        key={mark}
                        sx={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: `${mark}%`,
                            height: '1px',
                            background: 'rgba(33, 150, 243, 0.3)',
                            zIndex: 1
                        }}
                    />
                ))}

                {/* Icono de más en el centro */}
                {!disabled && (
                    <Box
                        sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            zIndex: 2,
                            background: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '50%',
                            width: 24,
                            height: 24,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: percentage < 100 ? 1 : 0.5
                        }}
                    >
                        <AddIcon fontSize="small" color="primary" />
                    </Box>
                )}
            </Box>

            {/* Información del progreso */}
            <Typography
                variant="body2"
                sx={{
                    fontWeight: 600,
                    color: isGoalAchieved ? 'success.main' : 'primary.main',
                    mb: 0.5
                }}
            >
                {currentMl}ml / {targetMl}ml
            </Typography>

            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1 }}
            >
                {(currentMl / 250).toFixed(0)} vasos de 250ml
            </Typography>

            {/* Barra de progreso */}
            <Box sx={{ width: '100%', mb: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        '& .MuiLinearProgress-bar': {
                            backgroundColor: isGoalAchieved ? '#4caf50' : '#2196f3',
                            borderRadius: 4,
                        }
                    }}
                />
            </Box>

            <Typography
                variant="caption"
                sx={{
                    fontWeight: 600,
                    color: isGoalAchieved ? 'success.main' : 'text.secondary'
                }}
            >
                {percentage.toFixed(0)}% completado
            </Typography>

            {/* Botón de agregar agua alternativo */}
            {!disabled && (
                <IconButton
                    onClick={onAddWater}
                    disabled={disabled}
                    sx={{
                        mt: 1,
                        backgroundColor: 'primary.main',
                        color: 'white',
                        '&:hover': {
                            backgroundColor: 'primary.dark',
                        },
                        '&:disabled': {
                            backgroundColor: 'grey.300',
                        }
                    }}
                    size="small"
                >
                    <AddIcon />
                </IconButton>
            )}

            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                +250ml por toque
            </Typography>
        </Box>
    );
};

export default WaterGlass; 