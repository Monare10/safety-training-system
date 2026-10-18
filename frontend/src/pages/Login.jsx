import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Link,
  InputAdornment, Divider, Stack,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ShieldIcon from '@mui/icons-material/VerifiedUser'
import { useAuth } from '../context/AuthContext'
import logoWhite from '../assets/logo-white.svg'
import heroImg from '../assets/landing-hero.jpg'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('worker@site.com')
  const [password, setPassword] = useState('worker123')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      const u = await login(email, password)
      nav(u.role === 'admin' ? '/admin' : '/worker')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed')
    } finally { setLoading(false) }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `url(${heroImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Full-page overlay — same treatment as landing */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: {
            xs: 'linear-gradient(180deg, rgba(14,42,71,0.92) 0%, rgba(14,42,71,0.88) 100%)',
            md: 'linear-gradient(105deg, rgba(14,42,71,0.94) 0%, rgba(14,42,71,0.86) 30%, rgba(14,42,71,0.55) 55%, rgba(14,42,71,0.10) 100%)',
          },
        }}
      />

      {/* Content layer */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top bar: logo + back link */}
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box
            component={RouterLink}
            to="/"
            sx={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <Box
              component="img"
              src={logoWhite}
              alt="Monare Constructions"
              sx={{ height: { xs: 40, md: 52 } }}
            />
          </Box>

          
        </Box>

        {/* Main grid */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
            px: { xs: 3, md: 6 },
            pb: { xs: 4, md: 6 },
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1400,
              mx: 'auto',
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' },
              gap: { xs: 4, md: 8 },
              alignItems: 'center',
            }}
          >
            {/* LEFT — subtle welcome message */}
            <Box
              sx={{
                color: '#fff',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: 36, md: 54 },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                Welcome
                <br />
                <Box component="span" sx={{ color: '#fff' }}>back.</Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  fontSize: { xs: 16, md: 18 },
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.82)',
                  maxWidth: 520,
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                Sign in to continue your safety training and view your certifications.
              </Typography>

              <Stack
                direction="row"
                spacing={1.25}
                alignItems="center"
                sx={{
                  mt: 4,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                }}
              >
                <ShieldIcon sx={{ color: '#FFD400', fontSize: 20 }} />
                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.75)' }}
                >
                  Your credentials are encrypted and secure.
                </Typography>
              </Stack>
            </Box>

            {/* RIGHT — glass sign-in card */}
            <Card
              sx={{
                width: '100%',
                maxWidth: 440,
                mx: 'auto',
                bgcolor: 'rgba(14, 42, 71, 0.55)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.15)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
                color: '#fff',
              }}
            >
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  gutterBottom
                  sx={{ color: '#fff' }}
                >
                  Sign in
                </Typography>
                <Typography
                  variant="body2"
                  mb={3}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Enter your credentials to access your training portal.
                </Typography>

                {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

                <Box component="form" onSubmit={submit}>
                  <TextField
                    label="Email"
                    fullWidth
                    margin="normal"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={glassFieldSx}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={glassFieldSx}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mt: 3, py: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Signing in…' : 'Sign In'}
                  </Button>
                </Box>

                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={0.5}
                  mt={2}
                >
                  <Typography
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    New worker?
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/register"
                    sx={{ color: '#FFD400', fontWeight: 600 }}
                  >
                    Create an account
                  </Link>
                </Stack>

                <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.15)' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'rgba(255,255,255,0.55)',
                      letterSpacing: 1,
                    }}
                  >
                    DEMO ACCOUNTS
                  </Typography>
                </Divider>

                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 1.5,
                    p: 2,
                    fontSize: 13,
                    lineHeight: 1.8,
                    color: 'rgba(255,255,255,0.85)',
                  }}
                >
                  <Typography variant="body2">
                    <b style={{ color: '#fff' }}>Worker:</b> worker@site.com / worker123
                  </Typography>
                  <Typography variant="body2">
                    <b style={{ color: '#fff' }}>Admin:</b> admin@site.com / admin123
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: 2,
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}
          >
            © {new Date().getFullYear()} Monare Constructions · Safety Training &amp; Compliance
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

/* Glass field styling — matches register page */
const glassFieldSx = {
  '& .MuiOutlinedInput-root': {
    color: '#fff',
    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
    '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.35)' },
    '&.Mui-focused fieldset': { borderColor: '#F26522' },
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255,255,255,0.65)',
    '&.Mui-focused': { color: '#F26522' },
  },
  '& .MuiInputBase-input': { color: '#fff' },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 1000px rgba(14,42,71,0.9) inset',
    WebkitTextFillColor: '#fff',
    caretColor: '#fff',
    transition: 'background-color 9999s ease-out',
  },
}