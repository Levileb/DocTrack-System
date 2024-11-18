import { Route, Routes } from "react-router-dom";
import LoginForm from "../src/Components/client/LoginForm/LoginForm";
import Home from "./Components/client/navigation/Home";
import AddUsers from "./Components/client/AdminSide/AddUsers"; //Admin Side
import UpdateUsers from "./Components/client/AdminSide/UpdateUsers"; //Admin Side
import SubmitDocument from "./Components/client/navigation/SubmitDocument";
import Received from "./Components/client/navigation/Received";
import Receiving from "./Components/client/navigation/Receiving";
import Forwarded from "./Components/client/navigation/Forwarded";
import Completed from "./Components/client/navigation/Completed";
import Users from "./Components/client/AdminSide/Users"; //Admin Side
import UpdateDocument from "./Components/client/navigation/UpdateDocument";
import Forwarding from "./Components/client/navigation/Forwarding";
import AddOffice from "./Components/client/AdminSide/AddOffice"; //Admin Side
import Tracking from "./Components/client/navigation/Tracking";
import InternalLogs from "./Components/client/AdminSide/InternalLogs"; //Admin Side
import ViewCompleted from "./Components/client/navigation/ViewCompleted";
import Completing from "./Components/client/navigation/Completing";
import ArchiveDocument from "./Components/client/navigation/ArchiveDocument";
import UserProfile from "./Components/client/navigation/UserProfile";
import ArchiveUsers from "./Components/client/AdminSide/ArchiveUsers"; //Admin Side
import ArchiveOffice from "./Components/client/AdminSide/ArchiveOffice"; //Admin Side
import AdminTracking from "./Components/client/AdminSide/AdminTracking";
import AdminProfile from "./Components/client/AdminSide/AdminProfile";
import LandingPage from "./Components/client/LandingPage";
import VerifyEmail from "./Components/client/VerifyEmail";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/submit-document" element={<SubmitDocu />} />
        <Route path="/inbox" element={<Receive />} />
        <Route path="/forwarding-document/:docId" element={<Forwarding />} />
        <Route path="/receiving-document/:docId" element={<Receiving />} />
        <Route path="/completing-document/:docId" element={<Completing />} />
        <Route path="/forwarded-logs" element={<Forward />} />
        <Route path="/completed" element={<Complete />} />
        <Route path="/add-office" element={<AddOffice />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/update-user/:id" element={<UpdateUsers />} />
        <Route path="/view-user" element={<User />} />
        <Route path="/update-document/:id" element={<UpdateDocument />} />
        <Route path="/forwarding-document" element={<ForwardingTo />} />
        <Route path="/receiving-document" element={<ReceivingTo />} />
        <Route path="/track-document" element={<DocTrack />} />
        <Route path="/internal-logs" element={<Internal />} />
        <Route path="/user-profile" element={<ViewProfile />} />
        <Route path="/archived-document" element={<ArchiveDocu />} />
        <Route path="/view-complete/:docId" element={<ViewComplete />} />
        <Route path="/archived-users" element={<ArchivedUser />} />
        <Route path="/archived-offices" element={<ArchivedOffices />} />
        <Route path="/admin" element={<AdminHomepage />} />
        <Route path="/document-tracking" element={<AdminTrackingPage />} />
        <Route path="/user-profile-admin" element={<ProfileAdmin />} />
        <Route
          path="*"
          element={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                color: "white",
              }}
            >
              Error: Page Not Found!
            </div>
          }
        />
      </Routes>
    </div>
  );
}

function Login() {
  return <LoginForm />;
}

function HomePage() {
  return <Home />;
}

function SubmitDocu() {
  return <SubmitDocument />;
}

function Receive() {
  return <Received />;
}

function Forward() {
  return <Forwarded />;
}

function Complete() {
  return <Completed />;
}

function AddUser() {
  return <AddUsers />;
}

function User() {
  return <Users />;
}

function ForwardingTo() {
  return <Forwarding />;
}
function ReceivingTo() {
  return <Receiving />;
}

function DocTrack() {
  return <Tracking />;
}
function ViewComplete() {
  return <ViewCompleted />;
}

// Inserted on Aug 13, 2024
function Internal() {
  return <InternalLogs />;
}
// Inserted on Aug 14, 2024
function ArchiveDocu() {
  return <ArchiveDocument />;
}
// Inserted on Aug 14, 2024
function ViewProfile() {
  return <UserProfile />;
}
// Inserted on Aug 19, 2024
function ArchivedUser() {
  return <ArchiveUsers />;
}
// Inserted on Aug 19, 2024
function ArchivedOffices() {
  return <ArchiveOffice />;
}
function AdminHomepage() {
  return <InternalLogs />;
}
function AdminTrackingPage() {
  return <AdminTracking />;
}
function ProfileAdmin() {
  return <AdminProfile />;
}
function Landing() {
  return <LandingPage />;
}
export default App;
