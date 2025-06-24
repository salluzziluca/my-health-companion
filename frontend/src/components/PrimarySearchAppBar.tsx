import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MoreIcon from '@mui/icons-material/MoreVert';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { NotificationsBell } from './GoalNotifications';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { jwtDecode } from 'jwt-decode';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

export default function PrimarySearchAppBar() {

  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleGoToProfile = () => {
    handleMenuClose(); // cerramos el menú
    navigate('/myprofile'); // navegamos a /profile
  };

  const handleGoToAccount = () => {
    handleMenuClose(); // cerramos el menú
    navigate('/myaccount'); // navegamos a /account
  };

  const handleGoToWeeklyDiet = () => {
    handleMenuClose();
    navigate('/weekly-diet');
  };

  const handleGoToTemplateDiets = () => {
    handleMenuClose();
    navigate('/template-diets');
  };

  const handleLogout = async () => {
    try {
      // Primero cerramos el menú
      handleMenuClose();
      // Navegamos primero para desmontar los componentes
      navigate('/login', { replace: true });
      // Esperamos un momento para asegurarnos de que la navegación se complete
      await new Promise(resolve => setTimeout(resolve, 100));
      // Finalmente limpiamos el token
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const getUserTypeFromToken = (): string | null => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;

      const decoded = jwtDecode<any>(token);
      return decoded.user_type || decoded.type || decoded.role || null;
    } catch (error) {
      console.error('Error decodificando el token:', error);
      return null;
    }
  };

  const isProfessional = getUserTypeFromToken() === 'professional';

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleGoToProfile}>Profile</MenuItem>
      <MenuItem onClick={handleGoToAccount}>My account</MenuItem>
      <MenuItem onClick={handleGoToWeeklyDiet}>Mi Dieta Semanal</MenuItem>
      {isProfessional && (
        <MenuItem onClick={handleGoToTemplateDiets}>Plantillas de Dietas</MenuItem>
      )}
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <LogoutIcon sx={{ mr: 1, color: 'error.main' }} />
        Logout
      </MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem onClick={handleGoToWeeklyDiet}>
        <IconButton size="large" color="inherit">
          <RestaurantIcon />
        </IconButton>
        <p>Mi Dieta</p>
      </MenuItem>
      {isProfessional && (
        <MenuItem onClick={handleGoToTemplateDiets}>
          <IconButton size="large" color="inherit">
            <ContentCopyIcon />
          </IconButton>
          <p>Plantillas</p>
        </MenuItem>
      )}
      <MenuItem onClick={() => navigate('/shopping-list')}>
        <IconButton size="large" color="inherit">
          <ShoppingCartIcon />
        </IconButton>
        <p>Lista de Compras</p>
      </MenuItem>
      <MenuItem>
        <NotificationsBell />
        <p>Notificaciones</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
      <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
        <IconButton size="large" color="error">
          <LogoutIcon />
        </IconButton>
        <p>Logout</p>
      </MenuItem>
    </Menu>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            color="inherit"
            onClick={() => navigate('/dashboard')}
          >
            <HomeIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            My Health Companion
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/dashboard-entrenador')}
              sx={{ mr: 1 }}
            >
              <FitnessCenterIcon />
            </IconButton>
            <IconButton
              size="large"
              color="inherit"
              onClick={handleGoToWeeklyDiet}
              sx={{ mr: 1 }}
            >
              <RestaurantIcon />
            </IconButton>
            {isProfessional && (
              <IconButton
                size="large"
                color="inherit"
                onClick={handleGoToTemplateDiets}
                sx={{ mr: 1 }}
              >
                <ContentCopyIcon />
              </IconButton>
            )}
            <IconButton
              size="large"
              color="inherit"
              onClick={() => navigate('/shopping-list')}
              sx={{ mr: 1 }}
            >
              <ShoppingCartIcon />
            </IconButton>
            <NotificationsBell />
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}
