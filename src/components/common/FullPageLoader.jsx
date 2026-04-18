import React from 'react';
import { ShoppingBag } from 'lucide-react';
import Header from '../layout/Header';
import Footer from '../layout/Footer';
import Container from '../layout/Container';

const FullPageLoader = ({ message = 'Memuat data...' }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <Container className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center justify-center">
          <div className="bg-primary-50 p-4 rounded-3xl animate-bounce shadow-soft mb-6 border border-primary-100">
            <ShoppingBag className="text-primary-600 w-12 h-12" />
          </div>
          <p className="text-gray-500 font-medium animate-pulse">{message}</p>
        </div>
      </Container>
      <Footer />
    </div>
  );
};

export default FullPageLoader;
