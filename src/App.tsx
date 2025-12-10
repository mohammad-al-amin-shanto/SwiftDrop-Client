import { ToastContainer } from "react-toastify";
import "./App.css";
import AppRoutes from "./routes/AppRoutes";
import RouteChangeLoader from "./components/ui/RouteChangeLoader";

function App() {
  return (
    <>
      <RouteChangeLoader />
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        pauseOnHover
        theme="light"
      />
    </>
  );
}

export default App;
