import { Link as RouterLink } from 'react-router-dom'
import {
  Box, Typography, Button, Stack, Chip, Container,
} from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import LoginIcon from '@mui/icons-material/Login'
import ShieldIcon from '@mui/icons-material/VerifiedUser'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import TimerIcon from '@mui/icons-material/Timer'
import { useAuth } from '../context/AuthContext'
import logoWhite from '../assets/logo-white.svg'
import heroImg from '../assets/landing-hero.jpg'

export default function Landing() {
  const { user } = useAuth()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
        // --- The image sits on the bottom layer ---
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* ==========================================================
          THE OVERLAY — this is the important part.
          - From 0% to 55%: heavy navy opacity (text is legible)
          - From 55% to 100%: fades to transparent (photo shows)
          On mobile (<md) it goes fully dark because text is centered.
          ========================================================== */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'linear-gradient(180deg, rgba(14,42,71,0.92) 0%, rgba(14,42,71,0.85) 100%)',
            md: 'linear-gradient(100deg, rgba(14,42,71,0.96) 0%, rgba(14,42,71,0.88) 35%, rgba(14,42,71,0.5) 65%, rgba(14,42,71,0.05) 100%)',
          },
        }}
      />

      {/* Subtle diagonal hatch pattern overlay — construction vibe */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.05,
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0 2px, transparent 2px 14px)',
          pointerEvents: 'none',
        }}
      />

      {/* ==========================================================
          CONTENT LAYER — sits above the overlay
          ========================================================== */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {/* Top bar */}
        <Box sx={{ py: 3 }}>
          <Container maxWidth="lg">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box
                component={RouterLink}
                to="/"
                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
              >
                <img src={logoWhite} alt="Monare Constructions" style={{ height: 44 }} />
              </Box>

              {user ? (
                <Button
                  variant="contained" color="primary"
                  component={RouterLink}
                  to={user.role === 'admin' ? '/admin' : '/worker'}
                  endIcon={<ArrowForwardIcon />}
                >
                  Go to dashboard
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    startIcon={<LoginIcon />}
                    sx={{ color: '#fff' }}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="contained"
                    component={RouterLink}
                    to="/register"
                  >
                    Get started
                  </Button>
                </Stack>
              )}
            </Box>
          </Container>
        </Box>

        {/* Main hero content — left aligned on desktop, centered on mobile */}
        <Container
          maxWidth="lg"
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            py: 6,
          }}
        >
          <Box sx={{ maxWidth: { xs: '100%', md: 620 }, textAlign: { xs: 'center', md: 'left' } }}>
            <Chip
              label="SAFETY TRAINING PORTAL"
              size="small"
              sx={{
                bgcolor: 'rgba(242,101,34,0.18)',
                color: '#FFD400',
                fontWeight: 700,
                letterSpacing: 2,
                fontSize: 11,
                mb: 3,
                border: '1px solid rgba(255,212,0,0.35)',
              }}
            />

            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: 40, md: 62 },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.02em',
                color: '#fff',
              }}
            >
              Safety first.
              <br />
              <Box component="span" sx={{ color: '#F26522' }}>
                Every day.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 3,
                fontSize: { xs: 16, md: 19 },
                lineHeight: 1.6,
                color: 'rgba(255,255,255,0.85)',
                maxWidth: 520,
                mx: { xs: 'auto', md: 0 },
              }}
            >
              Monare Constructions' mandatory safety training &amp; certification
              portal. Complete your required courses, pass timed assessments,
              and stay site-eligible — all in one place.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ mt: 5, justifyContent: { xs: 'center', md: 'flex-start' } }}
            >
              <Button
                variant="contained"
                size="large"
                component={RouterLink}
                to={user ? (user.role === 'admin' ? '/admin' : '/worker') : '/login'}
                endIcon={<ArrowForwardIcon />}
                sx={{ py: 1.5, px: 3 }}
              >
                {user ? 'Continue training' : 'Sign in to start'}
              </Button>
              {!user && (
                <Button
                  variant="outlined"
                  size="large"
                  component={RouterLink}
                  to="/register"
                  sx={{
                    py: 1.5, px: 3,
                    color: '#fff',
                    borderColor: 'rgba(255,255,255,0.4)',
                    '&:hover': {
                      borderColor: '#fff',
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  Create account
                </Button>
              )}
            </Stack>

            {/* Feature highlights */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 4 }}
              sx={{
                mt: 6,
                justifyContent: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Feature icon={<ShieldIcon />} label="Role-based courses" />
              <Feature icon={<TimerIcon />} label="Timed assessments" />
              <Feature icon={<WorkspacePremiumIcon />} label="Verified certificates" />
            </Stack>
          </Box>
        </Container>

        {/* Footer strip */}
        <Box sx={{ py: 3, mt: 'auto' }}>
          <Container maxWidth="lg">
            <Typography
              variant="caption"
              sx={{ opacity: 0.55, fontSize: 12 }}
            >
              © {new Date().getFullYear()} Monare Constructions · Safety Training &amp; Compliance
            </Typography>
          </Container>
        </Box>
      </Box>
    </Box>
  )
}

function Feature({ icon, label }) {
  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      sx={{
        color: 'rgba(255,255,255,0.9)',
        justifyContent: { xs: 'center', md: 'flex-start' },
      }}
    >
      <Box
        sx={{
          width: 32, height: 32, borderRadius: '50%',
          bgcolor: 'rgba(242,101,34,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          '& svg': { fontSize: 18, color: '#F26522' },
        }}
      >
        {icon}
      </Box>
      <Typography variant="body2" fontWeight={600}>
        {label}
      </Typography>
    </Stack>
  )
}