import { Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import WorkerDashboard from './pages/WorkerDashboard'
import TrainingPlayer from './pages/TrainingPlayer'
import Quiz from './pages/Quiz'
import MyCertificates from './pages/MyCertificates'
import AdminDashboard from './pages/AdminDashboard'
import AdminTraining from './pages/AdminTraining'
import { useAuth } from './context/AuthContext'

const WorkerLayout = () => <Layout><Outlet /></Layout>
const AdminLayout = () => <Layout><Outlet /></Layout>

function Home() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/register" replace />
  return <Navigate to={user.role === 'admin' ? '/admin' : '/worker'} replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute roles={['worker']} />}>
        <Route element={<WorkerLayout />}>
          <Route path="/worker" element={<WorkerDashboard />} />
          <Route path="/training/:courseId" element={<TrainingPlayer />} />
          <Route path="/quiz/:courseId" element={<Quiz />} />
          <Route path="/certificates" element={<MyCertificates />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={['admin']} />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/training" element={<AdminTraining />} />
        </Route>
      </Route>

      <Route path="/" element={<Home />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}