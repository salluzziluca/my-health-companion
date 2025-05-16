import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import OutlinedInput from '@mui/material/OutlinedInput';
import { styled, useTheme } from '@mui/material/styles';
import { appColors } from '../../App';

interface ForgotPasswordProps {
    open: boolean;
    handleClose: () => void;
}

const StyledDialog = styled(Dialog)(({ theme }) => ({
    ...(theme.palette.mode === 'dark' && {
        '& .MuiDialogTitle-root': {
            color: '#fff',
            fontWeight: 500,
        },
        '& .MuiDialogContentText-root': {
            color: 'rgba(255, 255, 255, 0.9)',
        },
        '& .MuiOutlinedInput-root': {
            color: theme.palette.common.white,
            '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.23)',
            },
            '&:hover fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
            },
        },
        '& .MuiPaper-root': {
            backgroundColor: appColors.darkPaper,
            backdropFilter: 'blur(8px)',
        }
    }),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    ...(theme.palette.mode === 'dark' && {
        color: appColors.darkLink,
        fontWeight: 500,
        '&:hover': {
            color: '#fff',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
        },
    }),
}));

export default function ForgotPassword({ open, handleClose }: ForgotPasswordProps) {
    const theme = useTheme();

    return (
        <StyledDialog
            open={open}
            onClose={handleClose}
            slotProps={{
                paper: {
                    component: 'form',
                    onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        handleClose();
                    },
                    sx: {
                        backgroundImage: 'none',
                    },
                },
            }}
        >
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent
                sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}
            >
                <DialogContentText>
                    Enter your account&apos;s email address, and we&apos;ll send you a link to
                    reset your password.
                </DialogContentText>
                <OutlinedInput
                    autoFocus
                    required
                    margin="dense"
                    id="email"
                    name="email"
                    placeholder="Email address"
                    type="email"
                    fullWidth
                    sx={{
                        ...(theme.palette.mode === 'dark' && {
                            '&::placeholder': {
                                color: 'rgba(255, 255, 255, 0.7)',
                            },
                        }),
                    }}
                />
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
                <StyledButton onClick={handleClose}>Cancel</StyledButton>
                <Button variant="contained" type="submit">
                    Continue
                </Button>
            </DialogActions>
        </StyledDialog>
    );
} 