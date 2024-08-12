import { Route, Routes } from "react-router-dom";
import LoginForm from "../src/Components/client/LoginForm/LoginForm";
import Home from "./Components/client/navigation/Home";
import AddUsers from "./Components/client/navigation/AddUsers";
import UpdateUsers from "./Components/client/navigation/UpdateUsers";
import SubmitDocument from "./Components/client/navigation/SubmitDocument";
import Received from "./Components/client/navigation/Received";
import Forwarded from "./Components/client/navigation/Forwarded";
import Completed from "./Components/client/navigation/Completed";
import Users from "./Components/client/navigation/Users";
import UpdateDocument from "./Components/client/navigation/UpdateDocument";
import Forwarding from "./Components/client/navigation/Forwarding";
import AddOffice from "./Components/client/navigation/AddOffice";
import Tracking from "./Components/client/navigation/Tracking";
import Receiving from "./Components/client/navigation/Receiving";
import Completing from "./Components/client/navigation/Completing";

function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/submit-document" element={<SubmitDocu />} />
        <Route path="/received" element={<Receive />} />
        <Route path="/forwarding-document/:docId" element={<Forwarding />} />
        <Route path="/receiving-document/:docId" element={<Receiving />} />
        <Route path="/completing-document/:docId" element={<Completing />} />
        <Route path="/forwarded" element={<Forward />} />
        <Route path="/completed" element={<Complete />} />
        <Route path="/add-office" element={<AddOffice />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/update-user/:id" element={<UpdateUsers />} />
        <Route path="/view-user" element={<User />} />
        <Route path="/update-document/:id" element={<UpdateDocument />} />
        <Route path="/forwarding-document" element={<ForwardingTo />} />
        <Route path="/receiving-document" element={<ReceivingTo />} />
        <Route path="/track-document" element={<DocTrack />} />
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

export default App;
