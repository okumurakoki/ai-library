import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ title, onMenuClick }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar
      position="fixed"
      sx={{
        backgroundColor: '#fff',
        color: '#000',
        boxShadow: 'none',
        borderBottom: '1px solid #e0e0e0',
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar>
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Box>
          {/* 将来的にユーザーアイコンやログインボタンを配置 */}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
