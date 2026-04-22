import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Category from './pages/Category';
import Region from './pages/Region';
import SubmitStory from './pages/SubmitStory';
import Profile from './pages/Profile';
import Constituencies from './pages/Constituencies';
import ConstituencyDetail from './pages/ConstituencyDetail';
import AuthorProfile from './pages/AuthorProfile';
import SubmitEvent from './pages/SubmitEvent';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 transition-colors duration-300">
        <Navbar />
        <main className="flex-grow pt-28 lg:pt-44">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/article/:id" element={<ArticleDetail />} />
            <Route path="/category/:category" element={<Category />} />
            <Route path="/region/:region" element={<Region />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor', 'reporter']}>
                  <Admin />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/submit-story" 
              element={
                <ProtectedRoute>
                  <SubmitStory />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/add-event" 
              element={
                <ProtectedRoute>
                  <SubmitEvent />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/nationwide" element={<Category category="nationwide" />} />
            <Route path="/constituencies" element={<Constituencies />} />
            <Route path="/constituency/:constituencyName" element={<ConstituencyDetail />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
