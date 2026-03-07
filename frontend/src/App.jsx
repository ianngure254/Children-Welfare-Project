import { motion } from "framer-motion";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from "./components/layout/Navbar";
import Whatsapp from "./components/layout/Whatsapp";
import Home from "./pages/Home";
import About from "./pages/About";
import Project from "./pages/Project";
import Event from "./pages/Event";
import Shop from "./pages/Shop";
import Volunteer from "./pages/Volunteer";
import Contact from "./pages/Contact";
import Footer from "./components/layout/Footer";

const App = () => {
  // 1. Define the reusable Animation Wrapper
  const SectionWrapper = ({ children, id }) => (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen" // Ensures smooth scrolling transitions
    >
      {children}
    </motion.section>
  );

  return (
    <div className="bg-white dark:bg-slate-900 scroll-smooth">
      <Navbar />
      <Whatsapp />

      {/* 2. Main content area with top margin to account for fixed Navbar */}
      <main className="mt-16"> 
        <SectionWrapper id="Home"><Home /></SectionWrapper>
        <SectionWrapper id="AboutUS"><About /></SectionWrapper>
        <SectionWrapper id="Project"><Project /></SectionWrapper>
        <SectionWrapper id="Events"><Event /></SectionWrapper>
        <SectionWrapper id="Shop"><Shop /></SectionWrapper>
        <SectionWrapper id="Volunteer"><Volunteer /></SectionWrapper>
        <SectionWrapper id="Contacts"><Contact /></SectionWrapper>
      </main>

      <Footer />
      
      {/* Toast Container for notifications */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default App;
