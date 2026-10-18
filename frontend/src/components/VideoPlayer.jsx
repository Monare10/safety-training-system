import { useEffect, useRef, useState } from 'react'
import { Box, LinearProgress, Typography, Alert, IconButton, Stack } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import PauseIcon from '@mui/icons-material/Pause'
import ReactPlayer from 'react-player/youtube'
import api from '../api'

export default function VideoPlayer({ course, enrollment, onCompleted }) {
  const playerRef = useRef(null)
  const maxAllowedRef = useRef(enrollment.last_position || 0)
  const [watched, setWatched] = useState(enrollment.watched_seconds || 0)
  const [lastPos, setLastPos] = useState(enrollment.last_position || 0)
  const [notice, setNotice] = useState('')
  const reportingRef = useRef(false)

  const [playing, setPlaying] = useState(false)
  const [playedSeconds, setPlayedSeconds] = useState(enrollment.last_position || 0)

  const duration = course.video_duration_sec || 1
  const progressPct = Math.min(100, (watched / duration) * 100)

  // Report progress to backend
  const report = async () => {
    if (reportingRef.current) return
    reportingRef.current = true

    // Read current time directly from the player
    const pos = playerRef.current ? playerRef.current.getCurrentTime() : lastPos

    if (pos > maxAllowedRef.current) maxAllowedRef.current = pos

    try {
      const { data } = await api.post(`/training/progress/${course.id}`, {
        watched_seconds: Math.min(duration, watched + Math.max(0, pos - lastPos)),
        last_position: pos,
      })
      setWatched(data.watched_seconds)
      setLastPos(pos)
      if (data.video_completed && onCompleted) onCompleted(data)
    } catch (e) {
      // ignore network errors
    } finally {
      reportingRef.current = false
    }
  }

  // Anti-skip logic: Check every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current && playing) {
        const current = playerRef.current.getCurrentTime()
        setPlayedSeconds(current)

        // If they somehow jump ahead more than 2 seconds
        if (current > maxAllowedRef.current + 2) {
          setNotice('Skipping ahead is disabled. Returning to your last watched position.')
          playerRef.current.seekTo(maxAllowedRef.current, 'seconds')
        } else {
          // Keep updating max allowed if they are playing normally
          if (current > maxAllowedRef.current) {
            maxAllowedRef.current = current
          }
        }
      }
    }, 500)

    return () => clearInterval(interval)
  }, [playing])

  // Report every 5 seconds while playing
  useEffect(() => {
    if (!playing) return
    const interval = setInterval(report, 5000)
    return () => {
      clearInterval(interval)
      report() // final report when paused
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, lastPos])

  // Handle end of video
  const handleEnded = () => {
    setPlaying(false)
    report()
  }

  // Custom seek (only allow going back)
  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const pct = (e.clientX - rect.left) / rect.width
    const target = pct * duration

    if (target > maxAllowedRef.current + 2) {
      setNotice('You cannot skip ahead.')
      return
    }
    if (playerRef.current) {
      playerRef.current.seekTo(target, 'seconds')
      setPlayedSeconds(target)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minHeight: 0 }}>
      {notice && (
        <Alert severity="warning" onClose={() => setNotice('')} sx={{ mb: 2, flexShrink: 0 }}>
          {notice}
        </Alert>
      )}

      {/* Video Container — Expands to fill available height */}
      <Box sx={{ 
        position: 'relative', 
        bgcolor: '#000', 
        borderRadius: 2, 
        overflow: 'hidden', 
        flexGrow: 1, 
        minHeight: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <ReactPlayer
          ref={playerRef}
          url={course.video_url}
          width="100%"
          height="100%"
          playing={playing}
          controls={false}
          onEnded={handleEnded}
          onReady={() => console.log('✅ Player ready, URL:', course.video_url)}
          onError={(e) => console.error('❌ Player error:', e)}
          config={{
            youtube: {
              playerVars: {
                disablekb: 1,
                modestbranding: 1,
                rel: 0,
                controls: 0,
                showinfo: 0
              }
            }
          }}
        />
      </Box>

      {/* Custom Controls — Fixed at the bottom */}
      <Box mt={2} sx={{ flexShrink: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={1}>
          <IconButton
            onClick={() => setPlaying(!playing)}
            color="primary"
            sx={{ bgcolor: 'rgba(242,101,34,0.1)' }}
          >
            {playing ? <PauseIcon /> : <PlayArrowIcon />}
          </IconButton>

          <Box flexGrow={1}>
            {/* Timeline */}
            <Box
              onClick={handleSeek}
              sx={{
                height: 12,
                bgcolor: '#E2E8F0',
                borderRadius: 6,
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Watched/Allowed portion */}
              <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${(maxAllowedRef.current / duration) * 100}%`,
                bgcolor: '#F26522',
              }} />
              {/* Current playback position */}
              <Box sx={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: `${(playedSeconds / duration) * 100}%`,
                bgcolor: '#0E2A47',
                opacity: 0.6
              }} />
            </Box>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 60, textAlign: 'right' }}>
            {Math.floor(playedSeconds)}s / {duration}s
          </Typography>
        </Stack>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Course Progress: {progressPct.toFixed(0)}%
        </Typography>
        <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 4 }} />

        {enrollment.video_completed && (
          <Typography variant="body2" color="success.main" mt={2} fontWeight={600}>
            ✅ Video complete — you can start the quiz.
          </Typography>
        )}
      </Box>
    </Box>
  )
}