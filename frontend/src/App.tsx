import { useAuth0 } from "@auth0/auth0-react";
import Users from "./pages/Users";
import './App.css';

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600 animate-pulse">Loading authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-indigo-700 text-white shadow-md py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold">ThesisBoard Client</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Users />
      </main>
      
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} ThesisBoard</p>
        </div>
      </footer>
    </div>
  );
}

export default App;