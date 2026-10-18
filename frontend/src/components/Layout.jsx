import {
  AppBar, Toolbar, Button, Box, Container, Avatar, Menu, MenuItem,
  IconButton, Divider, Typography, useMediaQuery, useTheme,
} from '@mui/material'
import { useState } from 'react'
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom'
import LogoutIcon from '@mui/icons-material/Logout'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.svg'
import logoMark from '../assets/logo-mark.svg'

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [anchor, setAnchor] = useState(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleLogout = () => { logout(); nav('/login') }

  const NavBtn = ({ to, label }) => {
    const active = loc.pathname === to
    return (
      <Button
        color="inherit"
        component={RouterLink}
        to={to}
        sx={{
          mx: 0.5,
          borderBottom: active ? '2px solid #F26522' : '2px solid transparent',
          borderRadius: 0,
          opacity: active ? 1 : 0.85,
          '&:hover': { opacity: 1, background: 'transparent' },
        }}
      >
        {label}
      </Button>
    )
  }

  return (
    <Box minHeight="100vh" bgcolor="#F4F6F8">
      <AppBar position="sticky" elevation={0}>
        <Toolbar sx={{ minHeight: 72 }}>
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: 'flex', alignItems: 'center', gap: 1.5,
              flexGrow: 1, textDecoration: 'none',
            }}
          >
            <Box
              component="img"
              src={isMobile ? logoMark : logo}
              alt="Monare Constructions"
              sx={{ height: { xs: 40, md: 44 }, display: 'block' }}
            />
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {user?.role === 'worker' && (
                <>
                  <NavBtn to="/worker" label="My Training" />
                  <NavBtn to="/certificates" label="Certificates" />
                </>
              )}
              {user?.role === 'admin' && (
                <>
                  <NavBtn to="/admin" label="Compliance" />
                  <NavBtn to="/admin/training" label="Courses" />
                </>
              )}
            </Box>
          )}

          {user && (
            <>
              <Divider
                orientation="vertical"
                flexItem
                sx={{ mx: 2, bgcolor: 'rgba(255,255,255,0.15)' }}
              />
              <IconButton onClick={(e) => setAnchor(e.currentTarget)} size="small">
                <Avatar
                  sx={{ width: 36, height: 36, bgcolor: '#F26522', fontWeight: 700 }}
                >
                  {user.full_name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <Box sx={{ px: 2, py: 1, minWidth: 220 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {user.full_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>
                <Divider />
                <MenuItem disabled sx={{ fontSize: 13 }}>
                  Role: {user.role}
                  {user.job_role ? ` · ${user.job_role}` : ''}
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                  Sign out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>{children}</Container>

      <Box
        component="footer"
        sx={{
          mt: 8, py: 3, textAlign: 'center',
          color: 'text.secondary', fontSize: 13,
          borderTop: '1px solid #E2E8F0',
        }}
      >
        © {new Date().getFullYear()} Monare Constructions · Safety Training &amp; Compliance
      </Box>
    </Box>
  )
}