const Volunteer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600 mb-4">
            Volunteer With Us
          </h1>
          <p className="text-xl text-gray-600">Make a lasting difference in a child's life</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-pink-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">💝</div>
            <h3 className="text-xl font-bold text-pink-600 mb-2">Share Love & Compassion</h3>
            <p className="text-gray-700">Give children the warmth and care they deserve, creating lasting bonds that transform lives.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-blue-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Shape Young Minds</h3>
            <p className="text-gray-700">Help children learn, grow, and discover their potential through education and mentorship.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-green-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">🌱</div>
            <h3 className="text-xl font-bold text-green-600 mb-2">Plant Seeds of Hope</h3>
            <p className="text-gray-700">Be the beacon of hope that guides children toward a brighter future and endless possibilities.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-yellow-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">🤝</div>
            <h3 className="text-xl font-bold text-yellow-600 mb-2">Build Community</h3>
            <p className="text-gray-700">Join a family of dedicated volunteers working together to create positive change.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-purple-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="text-xl font-bold text-purple-600 mb-2">Create Memories</h3>
            <p className="text-gray-700">Experience the joy of making unforgettable moments that children will cherish forever.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-t-4 border-red-500 hover:shadow-xl transition-shadow">
            <div className="text-3xl mb-3">🏆</div>
            <h3 className="text-xl font-bold text-red-600 mb-2">Transform Lives</h3>
            <p className="text-gray-700">Witness the incredible impact of your service as children thrive and flourish.</p>
          </div>
        </div>

        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make a Difference?</h2>
          <p className="text-xl mb-6">Your time and talent can change a child's story forever.</p>
          <button 
            onClick={() => document.getElementById('Contacts').scrollIntoView({ behavior: 'smooth' })}
            className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors cursor-pointer"
          >
            Start Volunteering Today
          </button>
        </div>
      </div>
    </div>
  )
}

export default Volunteer