import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";

import HomePage from "./pages/public/HomePage";
import CompetitionsPage from "./pages/public/CompetitionsPage";
import SlalomCompetitionsPage from "./pages/public/SlalomCompetitionsPage";
import BiathlonCompetitionsPage from "./pages/public/BiathlonCompetitionsPage";
import RankingsPage from "./pages/public/RankingsPage";
import StatisticsPage from "./pages/public/StatisticsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateCompetitionPage from "./pages/admin/CreateCompetitionPage";
import ManageAthletesPage from "./pages/admin/ManageAthletesPage";
import EnterResultsPage from "./pages/admin/EnterResultsPage";

import AthleteDashboard from "./pages/athlete/AthleteDashboard";
import MyRegistrationsPage from "./pages/athlete/MyRegistrationsPage";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/" element={<MainLayout />}>
                <Route index element={<HomePage />} />
                <Route path="competitions" element={<CompetitionsPage />} />
                <Route
                    path="competitions/slalom"
                    element={<SlalomCompetitionsPage />}
                />
                <Route
                    path="competitions/biathlon"
                    element={<BiathlonCompetitionsPage />}
                />
                <Route path="rankings" element={<RankingsPage />} />
                <Route path="statistics" element={<StatisticsPage />} />

                <Route
                    path="admin"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/competitions"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <CreateCompetitionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/athletes"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <ManageAthletesPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="admin/results"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ADMIN">
                            <EnterResultsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="athlete"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ATHLETE">
                            <AthleteDashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="athlete/registrations"
                    element={
                        <ProtectedRoute requiredRole="ROLE_ATHLETE">
                            <MyRegistrationsPage />
                        </ProtectedRoute>
                    }
                />
            </Route>
        </Routes>
    );
}

export default App;
