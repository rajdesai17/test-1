import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const attractions = [
    'Fort Heritage Tours',
    'Scuba Diving',
    'Beach Activities',
    'Malvani Food',
    'Water Sports',
    'Dolphin Safari'
  ];

  const featuredDestinations = [
    {
      title: "Sindhudurg Fort",
      description: "16th century sea fort built by Chhatrapati Shivaji Maharaj",
      image: "/sindhudurg-fort.jpg",
      rating: 4.8
    },
    {
      title: "Tarkarli Beach",
      description: "Crystal clear waters perfect for scuba diving and water sports",
      image: "/tarkarli-beach.jpg",
      rating: 4.7
    },
    {
      title: "Malvan Marine Sanctuary",
      description: "Rich marine life and coral reefs in pristine waters",
      image: "/marine-sanctuary.jpg",
      rating: 4.6
    }
  ];

  return (
    <>
      {/* Existing Hero Section */}
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden py-20">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 to-transparent" />
        
        {/* Background Image Cards */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-96 transform -rotate-12 hover:rotate-0 transition-all duration-300">
            <img 
              src="/sindhudurg-fort.jpg"
              alt="Sindhudurg Fort"
              className="w-full h-full object-cover rounded-2xl shadow-2xl hover:shadow-3xl"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
              <h3 className="text-white font-bold">Sindhudurg Fort</h3>
            </div>
          </div>

          <div className="absolute top-32 right-20 w-64 h-80 transform rotate-12 hover:rotate-0 transition-all duration-300">
            <img 
              src="/scuba.jpg"
              alt="Scuba Diving"
              className="w-full h-full object-cover rounded-2xl shadow-2xl hover:shadow-3xl"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
              <h3 className="text-white font-bold">Scuba Diving</h3>
            </div>
          </div>

          <div className="absolute bottom-20 left-32 w-64 h-80 transform rotate-6 hover:rotate-0 transition-all duration-300">
            <img 
              src="/beach.jpg"
              alt="Beach Activities"
              className="w-full h-full object-cover rounded-2xl shadow-2xl hover:shadow-3xl"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
              <h3 className="text-white font-bold">Beach Activities</h3>
            </div>
          </div>

          <div className="absolute bottom-32 right-32 w-72 h-96 transform -rotate-6 hover:rotate-0 transition-all duration-300">
            <img 
              src="/malvani-food.jpg"
              alt="Malvani Cuisine"
              className="w-full h-full object-cover rounded-2xl shadow-2xl hover:shadow-3xl"
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent rounded-b-2xl">
              <h3 className="text-white font-bold">Malvani Cuisine</h3>
            </div>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-6xl font-bold mb-6 leading-tight">
            Discover the Coastal<br/>
            <span className="text-orange-500">Paradise</span>
          </h1>
          
          <p className="text-xl text-gray-700 mb-10">
            Experience the perfect blend of history, adventure and serenity at Maharashtra's 
            crown jewel. From majestic forts to pristine beaches, create unforgettable memories.
          </p>

          <div className="mb-10">
            <h3 className="font-bold text-2xl mb-6">Featured Experiences</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {attractions.map(spot => (
                <span key={spot} 
                  className="bg-white/80 backdrop-blur px-6 py-3 rounded-lg 
                          text-orange-600 shadow-md hover:shadow-lg transition-all">
                  {spot}
                </span>
              ))}
            </div>
          </div>

          <Link 
            to="/tours"  
            className="inline-block bg-orange-500 text-white px-12 py-4 rounded-lg
                    hover:bg-orange-600 transition-all text-xl font-bold shadow-lg"
          >
            Explore Tours
          </Link>
        </div>
      </div>

      {/* Featured Destinations Section */}
      <div className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Featured Destinations</h2>
            <p className="text-gray-600 text-lg">Discover the most popular spots in Sindhudurg</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredDestinations.map((destination, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="relative h-64">
                  <img 
                    src={destination.image}
                    alt={destination.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full">
                    <span className="text-orange-500 font-bold">{destination.rating} ⭐</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">{destination.title}</h3>
                  <p className="text-gray-600 mb-4">{destination.description}</p>
                  <Link 
                    to={`/tours?destination=${destination.title}`}
                    className="text-orange-500 font-semibold hover:text-orange-600 inline-flex items-center"
                  >
                    Explore More 
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Hero;
