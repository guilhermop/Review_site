import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import MediaDetail from "./pages/MediaDetail";
import CreateMedia from "./pages/CreateMedia";
import MyReviews from "./pages/MyReviews";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/media/new"
          element={
            <PrivateRoute>
              <CreateMedia />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-reviews"
          element={
            <PrivateRoute>
              <MyReviews />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/media/:id" element={<MediaDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;