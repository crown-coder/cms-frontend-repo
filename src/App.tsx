import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Overview from "./pages/dashboard/Overview";
import UsersPage from "./pages/dashboard/UsersPage";
import CasesPage from "./pages/dashboard/CasesPage";
import Settings from "./pages/dashboard/Settings";
import RoleGuard from "./components/RoleGuard";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route
            path="users"
            element={
              <RoleGuard allowedRoles={["super_admin"]}>
                <UsersPage />
              </RoleGuard>
            }
          />
          <Route path="cases" element={<CasesPage />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
