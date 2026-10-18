import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Grid, Card, CardContent, Typography, Button, Chip, Box, Alert,
} from '@mui/material'
import api from '../api'
import { useAuth } from '../context/AuthContext'

export default function WorkerDashboard() {
  const { user } = useAuth()
  const nav = useNavigate()
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])

  const load = async () => {
    const [e, c] = await Promise.all([
      api.get('/training/enrollments'),
      api.get('/training/courses'),
    ])
    setEnrollments(e.data)
    setCourses(c.data)
  }

  useEffect(() => { load() }, [])

  const enroll = async (courseId) => {
    await api.post(`/training/enroll/${courseId}`)
    await load()
    nav(`/training/${courseId}`)
  }

  const byCourse = Object.fromEntries(enrollments.map((e) => [e.course.id, e]))

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Welcome, {user.full_name}</Typography>
      <Typography color="text.secondary" mb={3}>
        Job Role: <b>{user.job_role || '—'}</b> · Complete required training to stay site-eligible.
      </Typography>

      {courses.length === 0 && (
        <Alert severity="info">No courses are assigned to your job role yet.</Alert>
      )}

      <Grid container spacing={3}>
        {courses.map((c) => {
          const e = byCourse[c.id]
          const status = e?.quiz_passed ? 'Certified'
            : e?.video_completed ? 'Ready for quiz'
            : e ? 'In progress' : 'Not started'
          const color = e?.quiz_passed ? 'success'
            : e?.video_completed ? 'warning'
            : 'default'
          return (
            <Grid item xs={12} md={6} key={c.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{c.title}</Typography>
                    <Chip label={status} color={color} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
                    {c.description}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pass score: {c.pass_score}% · Quiz time: {c.quiz_duration_min} min
                  </Typography>
                  <Box mt={2}>
                    {!e && (
                      <Button variant="contained" onClick={() => enroll(c.id)}>
                        Start Training
                      </Button>
                    )}
                    {e && !e.quiz_passed && (
                      <Button variant="contained" onClick={() => nav(`/training/${c.id}`)}>
                        {e.video_completed ? 'Take Quiz' : 'Continue'}
                      </Button>
                    )}
                    {e?.quiz_passed && (
                      <Button variant="outlined" color="success" onClick={() => nav('/certificates')}>
                        View Certificate
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}