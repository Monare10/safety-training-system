import { useEffect, useState } from 'react'
import {
  Grid, Card, CardContent, Typography, LinearProgress, Box, Alert,
  Table, TableHead, TableRow, TableCell, TableBody,
} from '@mui/material'
import api from '../api'

function Stat({ label, value, color = 'primary.main' }) {
  return (
    <Card>
      <CardContent>
        <Typography color="text.secondary" variant="body2">{label}</Typography>
        <Typography variant="h4" color={color} fontWeight={700}>{value}</Typography>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [expiring, setExpiring] = useState([])

  useEffect(() => {
    api.get('/admin/compliance').then((r) => setData(r.data))
    api.get('/admin/expiring?days=60').then((r) => setExpiring(r.data))
  }, [])

  if (!data) return <Typography>Loading…</Typography>

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Compliance Dashboard</Typography>
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Workers" value={data.total_workers} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Site-Eligible" value={data.eligible_workers} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Valid Certificates" value={data.valid_certificates} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Stat label="Total Certificates" value={data.total_certificates} />
        </Grid>
      </Grid>

      <Typography variant="h6" mb={2}>Per-Course Compliance</Typography>
      <Card sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Course</TableCell>
              <TableCell>Job Role</TableCell>
              <TableCell align="right">Targeted</TableCell>
              <TableCell align="right">Completed</TableCell>
              <TableCell sx={{ width: '30%' }}>Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.per_course.map((c) => (
              <TableRow key={c.course_id}>
                <TableCell>{c.title}</TableCell>
                <TableCell>{c.job_role}</TableCell>
                <TableCell align="right">{c.targeted}</TableCell>
                <TableCell align="right">{c.completed}</TableCell>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LinearProgress
                      variant="determinate"
                      value={c.rate}
                      sx={{ flexGrow: 1, height: 10, borderRadius: 5 }}
                      color={c.rate >= 80 ? 'success' : c.rate >= 50 ? 'warning' : 'error'}
                    />
                    <Typography variant="body2">{c.rate}%</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Typography variant="h6" mb={2}>Certificates Expiring in 60 Days</Typography>
      {expiring.length === 0 ? (
        <Alert severity="success">No certificates expiring soon.</Alert>
      ) : (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Worker</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell align="right">Days Left</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {expiring.map((e) => (
                <TableRow key={e.serial}>
                  <TableCell>{e.user}</TableCell>
                  <TableCell>{e.email}</TableCell>
                  <TableCell>{e.course}</TableCell>
                  <TableCell>{new Date(e.expires_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Typography
                      color={e.days_left <= 14 ? 'error.main' : 'warning.main'}
                      fontWeight={600}
                    >
                      {e.days_left}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </Box>
  )
}