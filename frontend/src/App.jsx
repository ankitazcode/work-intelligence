import { useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function App() {
  const [token, setToken] = useState("");

  return (
    <div>
      {!token ? (
        <Login setToken={setToken} />
      ) : (
        <Dashboard token={token} />
      )}
    </div>
  );
}

export default App;