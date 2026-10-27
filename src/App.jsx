import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from './layouts/MainLayout.jsx'
import AuthProvider from './context/AuthProvider.jsx'
import { RequireAuth } from './components/Auth/AuthGate.jsx'
import AuthGateProvider from './components/Auth/AuthGateProvider.jsx'
import LoginPage from './pages/auth/LoginPage.jsx'
import RegisterPage from './pages/auth/RegisterPage.jsx'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage.jsx'
import AddComplexPage from './pages/AddComplexPage.jsx'
import HomePage from './pages/HomePage.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import CategoriesPage from './pages/CategoriesPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import InfoPage from './pages/InfoPage.jsx'
import JobDetailPage from './pages/JobDetailPage.jsx'
import CompanyDetailPage from './pages/CompanyDetailPage.jsx'
import SavedPage from './pages/SavedPage.jsx'
import NewsDetailPage from './pages/NewsDetailPage.jsx'
import EventDetailPage from './pages/EventDetailPage.jsx'
import ComplexDetailPage from './pages/ComplexDetailPage.jsx'
import ExplorePage from './pages/ExplorePage.jsx'
import { jobs } from './data/jobs.js'
import { DEFAULT_COMPANY_ID } from './data/companies.js'
import MapPageSkeleton from './components/JobsMap/MapPageSkeleton.jsx'
import { loadJobsMapPage } from './pages/jobsMapLoader.js'

// Leaflet faqat xarita sahifasi ochilganda yuklanadi
const JobsMapPage = lazy(loadJobsMapPage)

const demoJobId = jobs.find((j) => j.companyId === DEFAULT_COMPANY_ID)?.id ?? 1

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AuthGateProvider>
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/bron/:jobId" element={<JobDetailPage />} />
            <Route path="/bron" element={<Navigate to={`/bron/${demoJobId}`} replace />} />
            <Route path="/majmua/:companyId" element={<CompanyDetailPage />} />
            <Route path="/sport-majmua/:complexId" element={<ComplexDetailPage />} />
            <Route path="/majmualar" element={<Navigate to={`/majmua/${DEFAULT_COMPANY_ID}`} replace />} />
            <Route path="/kirish" element={<LoginPage />} />
            <Route path="/royxatdan-otish" element={<RegisterPage />} />
            <Route path="/parolni-tiklash" element={<ForgotPasswordPage />} />
            <Route
              path="/majmua-qoshish"
              element={
                <RequireAuth from="/majmua-qoshish">
                  <AddComplexPage />
                </RequireAuth>
              }
            />
            <Route path="/sport-turlari" element={<CategoriesPage />} />
            <Route path="/sport/:categoryId" element={<CategoryPage />} />
            <Route path="/profil" element={<ProfilePage />} />
            <Route
              path="/saqlanganlar"
              element={
                <RequireAuth from="/saqlanganlar" reason="saved">
                  <SavedPage />
                </RequireAuth>
              }
            />
            <Route
              path="/xarita"
              element={
                <Suspense fallback={<MapPageSkeleton />}>
                  <JobsMapPage />
                </Suspense>
              }
            />
            <Route path="/yangilik/:newsId" element={<NewsDetailPage />} />
            <Route path="/tadbir/:eventId" element={<EventDetailPage />} />
            <Route path="/bolim/:section" element={<ExplorePage />} />
            <Route path="/bolim/:section/:itemId" element={<ExplorePage />} />
            <Route path="/sahifa/:slug" element={<InfoPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
        </AuthGateProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
