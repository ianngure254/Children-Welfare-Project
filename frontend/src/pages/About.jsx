import { motion } from 'framer-motion';
import { Church, Heart, Users, BookOpen, Calendar, Award, Target, Sparkles, Quote, Star, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const About = () => {
  // Image carousel state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Joy-themed images from assets
  const joyImages = [

    { src: '/public/assets/joy.png', alt: 'Joy in Christ' },
    { src: '/public/assets/mercy.png', alt: 'Divine Mercy' },
    { src: '/public/assets/peace.png', alt: 'Peace of God' },
    { src: '/public/assets/love.png', alt: "God's Love" },
    { src: '/public/assets/faith.png', alt: 'Living Faith' }


  ];

  // Auto-rotate images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % joyImages.length);
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [joyImages.length]);

  // Manual navigation
  const goToPreviousImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? joyImages.length - 1 : prevIndex - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % joyImages.length);
  };
  const teamMembers = [
    {
      name: "Pastor Mary Watere Mbugua",
      role: "Founder",
      description: "Leading our organisation with 30+ years of ministry experience"
    },
    {
      name: "Wilson",
      role: "Director", 
      description: "Guiding the ministry with passion and excellence"
    },
    {
      name: "James Chen",
      role: "Youth Ministry Leader",
      description: "Mentoring the next generation of faith leaders"
    },
    {
      name: "Maria Rodriguez",
      role: "Community Outreach Coordinator",
      description: "Connecting our church with the local community"
    }
  ];

  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Love & Compassion",
      description: "We believe in showing God's love through acts of kindness and service to others."
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Biblical Truth",
      description: "We are grounded in the Word of God and strive to live according to its teachings."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Community",
      description: "We are a family that supports, encourages, and grows together in faith."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Mission",
      description: "We are called to make disciples and share the good news with the world."
    }
  ];

  const stats = [
    { number: "100+", label: "Active Members" },
    { number: "10+", label: "Ministry Programs" },
    { number: "20+", label: "Years of Service" },
    { number: "200+", label: "Lives Impacted" }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative bg-linear-to-r from-purple-900 to-indigo-900 text-white py-20"
      >
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Church className="w-16 h-16 mx-auto mb-4 text-purple-200" />
            <h1 className="text-4xl md:text-5xl font-bold mb-4">About Body of Christ Children home</h1>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              A vibrant community of believers dedicated to spreading God's love and transforming lives through faith.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
          <div className="max-w-3xl mx-auto">
            <Quote className="w-12 h-12 text-purple-600 mx-auto mb-4" />
            <p className="text-xl text-gray-700 leading-relaxed italic">
              "To be a loving community that worships God, grows in faith, serves others, and shares the good news of Jesus Christ with everyone."
            </p>
          </div>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              className="bg-white p-6 rounded-lg shadow-md text-center border border-gray-100"
            >
              <div className="text-3xl font-bold text-purple-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Our Story */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <div className="space-y-4 text-gray-700">
              <p>
               Founded in 2004 by Pastor Mary Watare Mbugua, Body of Christ Center was born from a moment of profound loss that became a powerful calling.

After the heartbreaking loss of her son, Pastor Mary chose purpose over pain. In the depths of her grief, she made a life-defining promise:
              </p>
              <p>
                “Everything I would have given my childlove, food, clothing, shelter, education, protectionI will now give to the orphaned, the vulnerable, and the forgotten.”

From that sacred commitment, a vacant house was transformed into a sanctuary of hope.
What began as one mother’s act of compassion has grown into a thriving home for over 160 vulnerable childrena place where the truly needy and less fortunate are not just sheltered, but nurtured, educated, protected, and empowered to dream again.

              </p>
              <p>
                Body of Christ Center is more than a children’s home.
It is a living legacy of love proof that even in the face of tragedy, compassion can rebuild lives and restore futures.

              </p>
            </div>
          </div>
          <div className="relative bg-linear-to-br from-purple-100 to-indigo-100 rounded-2xl p-8 flex items-center justify-center overflow-hidden">
            {/* Image Carousel */}
            <div className="relative w-full h-80 flex items-center justify-center">
              <motion.img
                key={currentImageIndex}
                src={joyImages[currentImageIndex].src}
                alt={joyImages[currentImageIndex].alt}
                className="w-full h-full object-cover rounded-xl shadow-2xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              
              {/* Navigation Buttons */}
              <button
                onClick={goToPreviousImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-purple-600 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6 rotate-180" />
              </button>
              <button
                onClick={goToNextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-purple-600 p-2 rounded-full shadow-lg transition-all hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              
              {/* Image Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {joyImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex 
                        ? 'bg-purple-600 w-8' 
                        : 'bg-white/60 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Core Values */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              >
                <div className="text-purple-600 mb-4 flex justify-center">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What We Believe */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg p-8 mb-16 border border-gray-100"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What We Believe</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">The Bible</h4>
                  <p className="text-gray-600 text-sm">We believe the Bible is God's inspired Word and our ultimate authority for faith and life.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">God</h4>
                  <p className="text-gray-600 text-sm">We believe in one God who exists as Father, Son, and Holy Spirit.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Jesus Christ</h4>
                  <p className="text-gray-600 text-sm">We believe Jesus is the Son of God, who died for our sins and rose again.</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 -shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Salvation</h4>
                  <p className="text-gray-600 text-sm">We believe salvation is by grace through faith in Jesus Christ alone.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">The Church</h4>
                  <p className="text-gray-600 text-sm">We believe the Church is God's instrument to bring His kingdom to earth.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 mt-1 shrink-0" />
                <div>
                  <h4 className="font-semibold text-gray-900">Eternal Life</h4>
                  <p className="text-gray-600 text-sm">We believe in eternal life with God for those who trust in Jesus.</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leadership Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-6 rounded-lg shadow-md border border-gray-100 text-center"
              >
                <div className="w-20 h-20 bg-linear-to-br from-purple-400 to-indigo-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Users className="w-10 h-10 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{member.name}</h3>
                <p className="text-purple-600 text-sm mb-2">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-16 bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white text-center"
        >
          <Award className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Join Our Family</h2>
          <p className="text-purple-100 mb-6 max-w-2xl mx-auto">
            We'd love for you to be part of our community. Whether you're new to faith or looking for a church home, 
            you're welcome here at Body of Christ Church.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-purple-50 transition-colors flex items-center justify-center space-x-2"
            >
              <Calendar className="w-5 h-5" />
              <span>Visit Us Today</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors flex items-center justify-center space-x-2"
            >
              <ChevronRight className="w-5 h-5" />
              
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;