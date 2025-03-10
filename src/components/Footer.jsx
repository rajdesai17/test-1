import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-xl mb-4">MySindhudurg</h3>
            <p className="text-gray-600">
              Discover the beauty of Maharashtra's coastal paradise through our curated experiences.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/tours" className="block text-gray-600 hover:text-orange-500">Tours</Link>
              <Link to="/about" className="block text-gray-600 hover:text-orange-500">About</Link>
              <Link to="/login" className="block text-gray-600 hover:text-orange-500">Login</Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Popular Tours</h4>
            <div className="space-y-2">
              <Link to="/tours?destination=Sindhudurg Fort" className="block text-gray-600 hover:text-orange-500">
                Fort Heritage Tours
              </Link>
              <Link to="/tours?activity=Scuba" className="block text-gray-600 hover:text-orange-500">
                Scuba Diving
              </Link>
              <Link to="/tours?activity=Marine" className="block text-gray-600 hover:text-orange-500">
                Marine Sanctuary
              </Link>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-2 text-gray-600">
              <p className="flex items-center">
                <Mail className="w-4 h-4 mr-2"/>
                info@mysindhudurg.com
              </p>
              <p className="flex items-center">
                <Phone className="w-4 h-4 mr-2"/>
                +91 12345 67890
              </p>
              <p className="flex items-center">
                <MapPin className="w-4 h-4 mr-2"/>
                Malvan, Sindhudurg
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t mt-12 pt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} MySindhudurg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;