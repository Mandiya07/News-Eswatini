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
import Directory from './pages/Directory';
import BusinessDetail from './pages/BusinessDetail';
import RegisterBusiness from './pages/RegisterBusiness';
import MinistryPortal from './pages/MinistryPortal';
import EditorPortal from './pages/EditorPortal';
import GovernmentGazette from './pages/GovernmentGazette';
import Classifieds from './pages/Classifieds';
import SubmitClassified from './pages/SubmitClassified';
import PoliticianPortal from './pages/PoliticianPortal';
import BountyBoard from './pages/BountyBoard';
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
            <Route path="/category/:category/constituency/:constituencyName" element={<Category />} />
            <Route path="/region/:region" element={<Region />} />
            <Route path="/region/:region/category/:category" element={<Region />} />
            <Route path="/login" element={<Login />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/directory/:id" element={<BusinessDetail />} />
            <Route path="/register-business" element={<RegisterBusiness />} />
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
            <Route 
              path="/ministry-portal" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'ministry_admin']}>
                  <MinistryPortal />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/editor-portal" 
              element={
                <ProtectedRoute allowedRoles={['admin', 'editor']}>
                  <EditorPortal />
                </ProtectedRoute>
              } 
            />
            <Route path="/nationwide" element={<Category category="nationwide" />} />
            <Route path="/constituencies" element={<Constituencies />} />
            <Route path="/constituency/:constituencyName" element={<ConstituencyDetail />} />
            <Route path="/author/:id" element={<AuthorProfile />} />
            <Route path="/gazette" element={<GovernmentGazette />} />
            <Route path="/classifieds" element={<Classifieds />} />
            <Route path="/bounties" element={<BountyBoard />} />
            <Route path="/submit/classified" element={<SubmitClassified />} />
            <Route path="/mp-portal" element={<ProtectedRoute><PoliticianPortal /></ProtectedRoute>} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}

export default App;
