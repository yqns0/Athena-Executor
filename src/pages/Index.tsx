
import { Heart, Calendar, Image as ImageIcon } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      <main className="container mx-auto px-4 py-16">
        <header className="text-center mb-16 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-light text-gray-800 mb-4">
            Notre Histoire d'Amour
          </h1>
          <p className="text-lg text-gray-600">4 ans de bonheur partagé</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link 
            to="/timeline"
            className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-rose-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Calendar className="h-8 w-8 mb-4 text-rose-400" />
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Chronologie</h2>
            <p className="text-gray-600">Notre histoire au fil du temps</p>
          </Link>

          <Link 
            to="/galerie"
            className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-rose-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <ImageIcon className="h-8 w-8 mb-4 text-rose-400" />
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Galerie</h2>
            <p className="text-gray-600">Nos moments capturés en images</p>
          </Link>

          <Link 
            to="/lettres"
            className="group relative overflow-hidden rounded-xl bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-rose-100/50 to-rose-200/50 opacity-0 group-hover:opacity-100 transition-opacity" />
            <Heart className="h-8 w-8 mb-4 text-rose-400" />
            <h2 className="text-2xl font-medium text-gray-800 mb-2">Lettres d'Amour</h2>
            <p className="text-gray-600">Mes mots d'amour pour toi</p>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Index;
