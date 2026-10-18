import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, Button, Alert, Divider, Stack,
} from '@mui/material'
import api from '../api'
import VideoPlayer from '../components/VideoPlayer'

export default function TrainingPlayer() {
  const { courseId } = useParams()
  const nav = useNavigate()
  const [course, setCourse] = useState(null)
  const [enrollment, setEnrollment] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const [courses, enr] = await Promise.all([
        api.get('/training/courses'),
        api.get(`/training/enrollment/${courseId}`),
      ])
      const c = courses.data.find((x) => x.id === Number(courseId))
      setCourse(c)
      setEnrollment(enr.data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Failed to load')
    }
  }

  useEffect(() => { load() }, [courseId])

  if (error) return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>
  if (!course || !enrollment) return <Typography sx={{ p: 4 }}>Loading…</Typography>

  return (
    // Lock the page height to the viewport
    <Box
      sx={{
        height: 'calc(100vh - 72px)', // 72px is the AppBar height
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        px: { xs: 2, md: 4 },
        py: 2,
      }}
    >
      {/* Compact Header */}
      <Box sx={{ mb: 2, flexShrink: 0 }}>
        <Typography variant="h5" fontWeight={700} noWrap>
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {course.description}
        </Typography>
      </Box>

      {/* Video Area — grows to fill available space */}
      <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <CardContent
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2, md: 3 },
            '&:last-child': { pb: { xs: 2, md: 3 } },
          }}
        >
          {/* VideoPlayer wrapper */}
          <Box sx={{ flexGrow: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <VideoPlayer
              course={course}
              enrollment={enrollment}
              onCompleted={() => load()}
            />
          </Box>

          <Divider sx={{ my: 2, flexShrink: 0 }} />

          {/* Bottom controls row */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            sx={{ flexShrink: 0 }}
          >
            <Typography variant="body2" color="text.secondary">
              Watch at least 90% of the video to unlock the quiz.
            </Typography>
            <Button
              variant="contained"
              disabled={!enrollment.video_completed || enrollment.quiz_passed}
              onClick={() => nav(`/quiz/${course.id}`)}
            >
              {enrollment.quiz_passed ? 'Quiz Passed' : 'Start Quiz'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}