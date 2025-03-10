import React from 'react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-[500px]">
        <img 
          src="/beach.jpg"
          alt="Sindhudurg Fort Aerial View"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <h1 className="text-6xl font-bold text-white">Discover Sindhudurg</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Introduction */}
        <div className="max-w-4xl mx-auto space-y-16">
          <section>
            <h2 className="text-4xl font-bold mb-8 text-center">Welcome to the Coastal Paradise</h2>
            <p className="text-xl text-gray-600 leading-relaxed">
              Sindhudurg, Maharashtra's hidden gem, is where history meets the Arabian Sea. 
              Named after the magnificent sea fort built by Chhatrapati Shivaji Maharaj in 1664, 
              the district offers a perfect blend of historical marvels and natural wonders.
            </p>
          </section>

          {/* Image Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <img 
                src="/tarkarli-beach.jpg" 
                alt="Beautiful Beaches"
                className="rounded-lg shadow-lg h-72 w-full object-cover"
              />
              <h3 className="text-2xl font-bold">Pristine Beaches</h3>
              <p className="text-gray-600">
                Experience the untouched beauty of our coastline, from Tarkarli's 
                crystal-clear waters to Malvan's serene shores.
              </p>
            </div>
            <div className="space-y-4">
              <img 
                src="/sindhudurg-fort.jpg" 
                alt="Historical Forts"
                className="rounded-lg shadow-lg h-72 w-full object-cover"
              />
              <h3 className="text-2xl font-bold">Rich Heritage</h3>
              <p className="text-gray-600">
                Explore centuries-old forts that stand as testament to the 
                Maratha empire's naval supremacy.
              </p>
            </div>
          </section>

          {/* Features */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-12 py-12">
            <div className="text-center">
              <div className="text-5xl mb-6">🌊</div>
              <h3 className="text-2xl font-bold mb-4">Marine Life</h3>
              <p className="text-gray-600">
                Discover vibrant coral reefs and diverse marine life through 
                scuba diving and snorkeling.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-6">🍽️</div>
              <h3 className="text-2xl font-bold mb-4">Malvani Cuisine</h3>
              <p className="text-gray-600">
                Savor authentic coastal flavors, from fresh seafood to 
                traditional Malvani spices.
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-6">🎣</div>
              <h3 className="text-2xl font-bold mb-4">Local Life</h3>
              <p className="text-gray-600">
                Experience the warm hospitality and rich culture of 
                our fishing communities.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;