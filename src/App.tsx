import { Route, Routes } from 'react-router-dom';
import { RootLayout } from './components/layout/RootLayout';
import { RequireAuth, RequireAdmin, RequirePlatform } from './lib/guards';

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

        {/* --- Auth -------------------------------------------------------- */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />

        {/* --- Public product surface --------------------------------------
            Browsing requires an account (see supabase RLS), so these render
            a sign-in prompt rather than data when logged out. */}
        <Route path="browse" element={<Browse />} />
        <Route path="browse/:id" element={<ListingDetail />} />

        {/* --- Business dashboard ------------------------------------------ */}
        <Route path="app" element={<Protected><Dashboard /></Protected>} />
        <Route path="app/listings" element={<Protected><MyListings /></Protected>} />
        <Route path="app/listings/new" element={<Protected><ListingForm /></Protected>} />
        <Route path="app/listings/:id/edit" element={<Protected><ListingForm /></Protected>} />
        <Route path="app/requirements" element={<Protected><MyRequirements /></Protected>} />
        <Route path="app/requirements/new" element={<Protected><RequirementForm /></Protected>} />
        <Route path="app/requirements/:id/edit" element={<Protected><RequirementForm /></Protected>} />
        <Route path="app/matches" element={<Protected><Matches /></Protected>} />
        <Route path="app/messages" element={<Protected><Messages /></Protected>} />
        <Route path="app/messages/:id" element={<Protected><ConversationPage /></Protected>} />
        <Route path="app/settings" element={<Protected><Settings /></Protected>} />

        {/* --- Admin --------------------------------------------------------- */}
        <Route path="admin" element={<ProtectedAdmin><AdminOverview /></ProtectedAdmin>} />
        <Route path="admin/listings" element={<ProtectedAdmin><AdminListings /></ProtectedAdmin>} />
        <Route path="admin/requirements" element={<ProtectedAdmin><AdminRequirements /></ProtectedAdmin>} />
        <Route path="admin/businesses" element={<ProtectedAdmin><AdminBusinesses /></ProtectedAdmin>} />
        <Route path="admin/enquiries" element={<ProtectedAdmin><AdminEnquiries /></ProtectedAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
