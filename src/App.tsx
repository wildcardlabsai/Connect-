import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { RequireAuth, RequireAdmin, RequireApproved, RequirePlatform } from './lib/guards';

import Home from './pages/Home';
import HowItWorks from './pages/HowItWorks';
import ForBusinesses from './pages/ForBusinesses';
import Materials from './pages/Materials';
import About from './pages/About';
import FoundingNetwork from './pages/FoundingNetwork';
import Contact from './pages/Contact';
import Browse from './pages/Browse';
import ListingDetail from './pages/ListingDetail';
import NotFound from './pages/NotFound';
import Terms from './pages/legal/Terms';
import Privacy from './pages/legal/Privacy';

import Login from './pages/auth/Login';
import SignUp from './pages/auth/SignUp';

import Dashboard from './pages/app/Dashboard';
import MyListings from './pages/app/MyListings';
import ListingForm from './pages/app/ListingForm';
import MyRequirements from './pages/app/MyRequirements';
import RequirementForm from './pages/app/RequirementForm';
import Matches from './pages/app/Matches';
import Messages from './pages/app/Messages';
import ConversationPage from './pages/app/Conversation';
import Settings from './pages/app/Settings';

import AdminOverview from './pages/admin/AdminOverview';
import AdminListings from './pages/admin/AdminListings';
import AdminRequirements from './pages/admin/AdminRequirements';
import AdminBusinesses from './pages/admin/AdminBusinesses';
import AdminBusinessDetail from './pages/admin/AdminBusinessDetail';
import AdminEnquiries from './pages/admin/AdminEnquiries';

/** Wraps an /app or /admin page: a backend must be connected (Supabase, or
    Claude's own database — see platform.ts) and the visitor signed in
    before any of these render. */
function Protected({ children }: { children: React.ReactNode }) {
  return (
    <RequirePlatform>
      <RequireAuth>{children}</RequireAuth>
    </RequirePlatform>
  );
}

function ProtectedAdmin({ children }: { children: React.ReactNode }) {
  return (
    <RequirePlatform>
      <RequireAdmin>{children}</RequireAdmin>
    </RequirePlatform>
  );
}

/** As Protected, but also requires the business to be approved — for
    everything in the dashboard except Settings, which stays reachable so a
    pending or rejected business can still see and correct its details. */
function ProtectedApproved({ children }: { children: React.ReactNode }) {
  return (
    <RequirePlatform>
      <RequireAuth>
        <RequireApproved>{children}</RequireApproved>
      </RequireAuth>
    </RequirePlatform>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        {/* --- Marketing site -------------------------------------------- */}
        <Route index element={<Home />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="for-businesses" element={<ForBusinesses />} />
        <Route path="materials" element={<Materials />} />
        <Route path="about" element={<About />} />
        <Route path="founding-network" element={<FoundingNetwork />} />
        <Route path="contact" element={<Contact />} />
        <Route path="terms" element={<Terms />} />
        <Route path="privacy" element={<Privacy />} />

        {/* --- Auth -------------------------------------------------------- */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />

        {/* --- Public product surface --------------------------------------
            Browsing requires an account (see supabase RLS), so these render
            a sign-in prompt rather than data when logged out. */}
        <Route path="browse" element={<Browse />} />
        <Route path="browse/:id" element={<ListingDetail />} />

        {/* --- Business dashboard ------------------------------------------
            Everything except Settings also requires the business to be
            approved (RequireApproved) — a pending or rejected account sees a
            holding screen here instead. */}
        <Route path="app" element={<ProtectedApproved><Dashboard /></ProtectedApproved>} />
        <Route path="app/listings" element={<ProtectedApproved><MyListings /></ProtectedApproved>} />
        <Route path="app/listings/new" element={<ProtectedApproved><ListingForm /></ProtectedApproved>} />
        <Route path="app/listings/:id/edit" element={<ProtectedApproved><ListingForm /></ProtectedApproved>} />
        <Route path="app/requirements" element={<ProtectedApproved><MyRequirements /></ProtectedApproved>} />
        <Route path="app/requirements/new" element={<ProtectedApproved><RequirementForm /></ProtectedApproved>} />
        <Route path="app/requirements/:id/edit" element={<ProtectedApproved><RequirementForm /></ProtectedApproved>} />
        <Route path="app/matches" element={<ProtectedApproved><Matches /></ProtectedApproved>} />
        <Route path="app/messages" element={<ProtectedApproved><Messages /></ProtectedApproved>} />
        <Route path="app/messages/:id" element={<ProtectedApproved><ConversationPage /></ProtectedApproved>} />
        <Route path="app/settings" element={<Protected><Settings /></Protected>} />

        {/* --- Admin --------------------------------------------------------- */}
        <Route path="admin" element={<ProtectedAdmin><AdminOverview /></ProtectedAdmin>} />
        <Route path="admin/listings" element={<ProtectedAdmin><AdminListings /></ProtectedAdmin>} />
        <Route path="admin/requirements" element={<ProtectedAdmin><AdminRequirements /></ProtectedAdmin>} />
        <Route path="admin/businesses" element={<ProtectedAdmin><AdminBusinesses /></ProtectedAdmin>} />
        <Route path="admin/businesses/:id" element={<ProtectedAdmin><AdminBusinessDetail /></ProtectedAdmin>} />
        <Route path="admin/enquiries" element={<ProtectedAdmin><AdminEnquiries /></ProtectedAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
