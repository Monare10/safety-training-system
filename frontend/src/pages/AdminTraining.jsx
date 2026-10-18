import { useEffect, useState } from 'react'
import {
  Box, Card, CardContent, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Grid, IconButton,
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import api from '../api'

const emptyQ = () => ({
  text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'A',
})

export default function AdminTraining() {
  const [courses, setCourses] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(null)

  const load = () => api.get('/admin/courses').then((r) => setCourses(r.data))
  useEffect(() => { load() }, [])

  const newCourse = () => {
    setForm({
      title: '', description: '', job_role: 'General Laborer',
      video_url: '', video_duration_sec: 60, pass_score: 80,
      quiz_duration_min: 10, questions: [emptyQ()],
    })
    setOpen(true)
  }

  const editCourse = (c) => {
    setForm(JSON.parse(JSON.stringify(c)))
    setOpen(true)
  }

  const save = async () => {
    // Remove metadata fields the backend doesn't expect in the payload
    const { id, created_at, questions, ...courseData } = form
    
    // Ensure correct_option is uppercase and present
    const cleanQuestions = questions.map(q => ({
      ...q,
      correct_option: (q.correct_option || 'A').toUpperCase()
    }))

    const payload = { ...courseData, questions: cleanQuestions }

    try {
      if (form.id) {
        await api.put(`/admin/courses/${form.id}`, payload)
      } else {
        await api.post('/admin/courses', payload)
      }
      setOpen(false)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to save: ' + JSON.stringify(err.response?.data || err.message))
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this course?')) return
    await api.delete(`/admin/courses/${id}`)
    load()
  }

  const updateQ = (i, patch) => {
    const questions = [...form.questions]
    questions[i] = { ...questions[i], ...patch }
    setForm({ ...form, questions })
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Training Courses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={newCourse}>
          New Course
        </Button>
      </Box>

      <Grid container spacing={3}>
        {courses.map((c) => (
          <Grid item xs={12} md={6} key={c.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.title}</Typography>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  {c.description}
                </Typography>
                <Typography variant="caption">
                  Role: <b>{c.job_role}</b> · Questions: <b>{c.questions.length}</b> · Pass: <b>{c.pass_score}%</b>
                </Typography>
                <Box mt={2} display="flex" gap={1}>
                  <Button size="small" variant="outlined" onClick={() => editCourse(c)}>Edit</Button>
                  <IconButton size="small" color="error" onClick={() => remove(c.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{form?.id ? 'Edit Course' : 'New Course'}</DialogTitle>
        <DialogContent>
          {form && (
            <Box>
              <TextField label="Title" fullWidth margin="normal"
                value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <TextField label="Description" fullWidth margin="normal" multiline rows={2}
                value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Job Role" fullWidth margin="normal"
                    value={form.job_role} onChange={(e) => setForm({ ...form, job_role: e.target.value })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Video Duration (sec)" type="number" fullWidth margin="normal"
                    value={form.video_duration_sec}
                    onChange={(e) => setForm({ ...form, video_duration_sec: Number(e.target.value) })} />
                </Grid>
              </Grid>
              <TextField label="Video URL" fullWidth margin="normal"
                value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField label="Pass Score (%)" type="number" fullWidth margin="normal"
                    value={form.pass_score}
                    onChange={(e) => setForm({ ...form, pass_score: Number(e.target.value) })} />
                </Grid>
                <Grid item xs={6}>
                  <TextField label="Quiz Time (min)" type="number" fullWidth margin="normal"
                    value={form.quiz_duration_min}
                    onChange={(e) => setForm({ ...form, quiz_duration_min: Number(e.target.value) })} />
                </Grid>
              </Grid>

              <Typography variant="h6" mt={3} mb={1}>Questions</Typography>
              {form.questions.map((q, i) => (
                <Card key={i} variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <TextField label={`Question ${i + 1}`} fullWidth margin="dense"
                    value={q.text} onChange={(e) => updateQ(i, { text: e.target.value })} />
                  {['a', 'b', 'c', 'd'].map((k) => (
                    <TextField key={k} label={`Option ${k.toUpperCase()}`} fullWidth margin="dense"
                      value={q[`option_${k}`]} onChange={(e) => updateQ(i, { [`option_${k}`]: e.target.value })} />
                  ))}
                  <TextField label="Correct Option (A/B/C/D)" fullWidth margin="dense"
                    value={q.correct_option}
                    onChange={(e) => updateQ(i, { correct_option: e.target.value.toUpperCase() })} />
                  <Button size="small" color="error" sx={{ mt: 1 }}
                    onClick={() => setForm({ ...form, questions: form.questions.filter((_, x) => x !== i) })}>
                    Remove
                  </Button>
                </Card>
              ))}
              <Button startIcon={<AddIcon />}
                onClick={() => setForm({ ...form, questions: [...form.questions, emptyQ()] })}>
                Add Question
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}