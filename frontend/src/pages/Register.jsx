import { useState } from 'react'
import { useNavigate, Link as RouterLink } from 'react-router-dom'
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert, Link,
  InputAdornment, MenuItem, Stack,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import WorkIcon from '@mui/icons-material/Work'
import { useAuth } from '../context/AuthContext'
import logoWhite from '../assets/logo-white.svg'
import heroImg from '../assets/landing-hero.jpg'

const JOB_ROLES = [
  'Electrician',
  'General Laborer',
  'Roofer',
]

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    job_role: 'General Laborer',
  })
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setErr(''); setLoading(true)
    try {
      await register(form)
      nav('/worker')
    } catch (e) {
      setErr(e.response?.data?.detail || 'Registration failed')
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
      {/* Full-page overlay */}
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
        {/* Top bar with logo only (Back button removed) */}
        <Box
          sx={{
            px: { xs: 3, md: 6 },
            py: 3,
            display: 'flex',
            alignItems: 'center',
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
            {/* LEFT — hero text */}
            <Box
              sx={{
                color: '#fff',
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontSize: { xs: 36, md: 56 },
                  fontWeight: 800,
                  lineHeight: 1.05,
                  letterSpacing: '-0.02em',
                }}
              >
                Join the crew.
                <br />
                <Box component="span" sx={{ color: '#fff' }}>
                  Get certified.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  fontSize: { xs: 16, md: 19 },
                  lineHeight: 1.65,
                  color: 'rgba(255,255,255,0.85)',
                  maxWidth: 540,
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                Create your worker profile, complete your mandatory training,
                and unlock your digital safety certifications.
              </Typography>
            </Box>

            {/* RIGHT — glass registration card */}
            <Card
              sx={{
                width: '100%',
                maxWidth: 460,
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
                  Create account
                </Typography>
                <Typography
                  variant="body2"
                  mb={3}
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  All fields are required.
                </Typography>

                {err && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}

                <Box component="form" onSubmit={submit}>
                  <TextField
                    name="full_name"
                    label="Full name"
                    fullWidth
                    margin="normal"
                    required
                    value={form.full_name}
                    onChange={change}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={glassFieldSx}
                  />

                  <TextField
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    required
                    value={form.email}
                    onChange={change}
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
                    name="password"
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    required
                    value={form.password}
                    onChange={change}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={glassFieldSx}
                  />

                  <TextField
                    name="job_role"
                    label="Job role"
                    select
                    fullWidth
                    margin="normal"
                    value={form.job_role}
                    onChange={change}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <WorkIcon fontSize="small" sx={{ color: 'rgba(255,255,255,0.7)' }} />
                        </InputAdornment>
                      ),
                    }}
                    SelectProps={{
                      MenuProps: {
                        PaperProps: {
                          sx: {
                            bgcolor: '#0E2A47',
                            color: '#fff',
                            '& .MuiMenuItem-root:hover': {
                              bgcolor: 'rgba(242,101,34,0.2)',
                            },
                            '& .Mui-selected': {
                              bgcolor: 'rgba(242,101,34,0.35) !important',
                            },
                          },
                        },
                      },
                    }}
                    sx={glassFieldSx}
                  >
                    {JOB_ROLES.map((r) => (
                      <MenuItem key={r} value={r}>{r}</MenuItem>
                    ))}
                  </TextField>

                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    sx={{ mt: 3, py: 1.5 }}
                    disabled={loading}
                  >
                    {loading ? 'Creating account…' : 'Create Account'}
                  </Button>
                </Box>

                <Stack
                  direction="row"
                  justifyContent="center"
                  spacing={0.5}
                  mt={2}
                >
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.75)' }}>
                    Already have an account?
                  </Typography>
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{ color: '#FFD400', fontWeight: 600 }}
                  >
                    Sign in
                  </Link>
                </Stack>
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

/* Glass field styling — matches login page */
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
  '& .MuiSelect-icon': { color: 'rgba(255,255,255,0.7)' },
  '& input:-webkit-autofill': {
    WebkitBoxShadow: '0 0 0 1000px rgba(14,42,71,0.9) inset',
    WebkitTextFillColor: '#fff',
    caretColor: '#fff',
    transition: 'background-color 9999s ease-out',
  },
}