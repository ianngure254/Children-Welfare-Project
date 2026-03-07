import { Link as ScrollLink } from 'react-scroll';



const Home = () => {
  return (
    <div className="relative min-h-screen bg-linear-to-br from-blue-900 via-blue-700 to-indigo-800">
      <div className="absolute inset-0 bg-blue-900 bg-opacity-5"></div>
      
      <div className="absolute top-1/2 left-8 md:left-16 transform -translate-y-1/2 text-left max-w-4xl z-10">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Body of Christ Children's Home
        </h1>
        <p className="text-xl md:text-2xl font-semibold text-blue-100 mb-8 leading-relaxed">
          Transforming lives through faith, education, and community service.
        </p>
        <p className="text-lg md:text-xl font-medium text-blue-200 mb-8 leading-relaxed">
          Join us in building a brighter future for all.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <ScrollLink 
            to="Volunteer"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer"
          >
            Get Involved
          </ScrollLink>
          <ScrollLink 
            to="AboutUS"
            spy={true}
            smooth={true}
            offset={-70}
            duration={500}
            className="bg-transparent border-2 border-white hover:bg-white hover:text-blue-900 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
          >
            Learn More
          </ScrollLink>
        </div>
      </div>    
    </div>
  );
}

export default Home;