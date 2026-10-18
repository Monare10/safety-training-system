import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box, Card, CardContent, Typography, RadioGroup, FormControlLabel,
  Radio, Button, Alert, LinearProgress, Chip,
} from '@mui/material'
import api from '../api'

export default function Quiz() {
  const { courseId } = useParams()
  const nav = useNavigate()
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [duration, setDuration] = useState(0)
  const [startedAt, setStartedAt] = useState(null)
  const [remaining, setRemaining] = useState(0)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const load = async () => {
    try {
      const q = await api.get(`/quiz/${courseId}/questions`)
      setQuestions(q.data)
      const s = await api.post(`/quiz/${courseId}/start`)
      setDuration(s.data.duration_min)
      setStartedAt(Date.now())
      setRemaining(s.data.duration_min * 60)
    } catch (e) {
      setError(e.response?.data?.detail || 'Cannot start quiz')
    }
  }

  useEffect(() => { load() }, [courseId])

  useEffect(() => {
    if (!startedAt) return
    const t = setInterval(() => {
      const left = duration * 60 - Math.floor((Date.now() - startedAt) / 1000)
      setRemaining(left)
      if (left <= 0) { clearInterval(t); submit(true) }
    }, 1000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, duration])

  const submit = async (auto = false) => {
    try {
      const { data } = await api.post(`/quiz/${courseId}/submit`, { answers })
      setResult(data)
      if (data.passed) setTimeout(() => nav('/certificates'), 2500)
    } catch (e) {
      setError(e.response?.data?.detail || 'Submission failed')
    }
  }

  if (error) return <Alert severity="error">{error}</Alert>
  if (result) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h4" color={result.passed ? 'success.main' : 'error.main'} gutterBottom>
            {result.passed ? '✅ Passed!' : '❌ Not Passed'}
          </Typography>
          <Typography variant="h6">
            Score: {result.score}% ({result.correct}/{result.total})
          </Typography>
          {result.certificate_issued && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Certificate issued! Redirecting to your certificates…
            </Alert>
          )}
          {!result.passed && (
            <Button sx={{ mt: 3 }} variant="contained" onClick={() => location.reload()}>
              Try Again
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const mins = Math.floor(remaining / 60)
  const secs = remaining % 60
  const lowTime = remaining < 60

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5">Timed Assessment</Typography>
        <Chip
          label={`⏱ ${mins}:${String(secs).padStart(2, '0')}`}
          color={lowTime ? 'error' : 'primary'}
        />
      </Box>
      <LinearProgress
        variant="determinate"
        value={duration ? 100 - (remaining / (duration * 60)) * 100 : 0}
        sx={{ mb: 3 }}
      />
      {questions.map((q, i) => (
        <Card key={q.id} sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>
              {i + 1}. {q.text}
            </Typography>
            <RadioGroup
              value={answers[q.id] || ''}
              onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            >
              {['A', 'B', 'C', 'D'].map((k) => (
                <FormControlLabel
                  key={k}
                  value={k}
                  control={<Radio />}
                  label={q[`option_${k.toLowerCase()}`]}
                />
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
      <Button
        variant="contained"
        size="large"
        fullWidth
        disabled={Object.keys(answers).length < questions.length}
        onClick={() => submit(false)}
      >
        Submit Quiz
      </Button>
    </Box>
  )
}