import { useEffect, useState } from 'react'
import {
  Card, CardContent, Typography, Grid, Chip, Button, Box, Alert,
} from '@mui/material'
import DownloadIcon from '@mui/icons-material/Download'
import api from '../api'

export default function MyCertificates() {
  const [certs, setCerts] = useState([])

  useEffect(() => {
    api.get('/certificates/mine').then((r) => setCerts(r.data))
  }, [])

  const download = async (id) => {
    const res = await api.get(`/certificates/${id}/download`, { responseType: 'blob' })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `certificate-${id}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Certificates</Typography>
      {certs.length === 0 && (
        <Alert severity="info">You haven’t earned any certificates yet.</Alert>
      )}
      <Grid container spacing={3} mt={1}>
        {certs.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="h6">{c.course_title}</Typography>
                  <Chip
                    label={c.is_valid ? 'Valid' : 'Expired'}
                    color={c.is_valid ? 'success' : 'error'}
                    size="small"
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" mt={1}>
                  Serial: {c.serial}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Issued: {new Date(c.issued_at).toLocaleDateString()} ·
                  Expires: {new Date(c.expires_at).toLocaleDateString()}
                </Typography>
                <Typography variant="body2" mt={1}>
                  Score: <b>{c.score}%</b>
                </Typography>
                <Button
                  startIcon={<DownloadIcon />}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  onClick={() => download(c.id)}
                >
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}