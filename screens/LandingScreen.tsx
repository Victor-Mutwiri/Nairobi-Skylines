import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Truck, TreePine, Cpu, ArrowRight, MousePointer2 } from 'lucide-react';
import NairobiSkyline from '../components/NairobiSkyline';
import { Button } from '../components/ui/Button';

const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  const handleStartGame = () => {
    navigate('/game');
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-slate-900/80 border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-nairobi-yellow" />
            <span className="text-2xl font-display font-bold tracking-tighter text-white">
              NAIROBI <span className="text-nairobi-yellow">SKYLINES</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</a>
            <Button size="sm" onClick={handleStartGame}>Play Beta</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 flex-grow flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 z-0"></div>
        
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 mix-blend-soft-light"></div>
        
        <NairobiSkyline />

        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full border border-nairobi-yellow/30 bg-nairobi-yellow/10 backdrop-blur-sm">
            <span className="text-nairobi-yellow text-xs font-bold tracking-widest uppercase">
              Web-Based City Builder
            </span>
          </div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white mb-6 tracking-tight leading-none drop-shadow-2xl">
            BUILD THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nairobi-yellow via-orange-400 to-nairobi-red animate-pulse-slow">
              GREEN CITY
            </span>
            <br /> IN THE SUN
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience the chaos and charm of Nairobi. Manage matatu routes, solve traffic jams on Mombasa Road, and build a thriving metropolis in this low-poly, lightweight simulation.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={handleStartGame} className="w-full sm:w-auto group">
              Start Building 
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => window.location.hash = "#features"}>
              Learn More
            </Button>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Game Features</h2>
            <p className="text-slate-400">Optimized for performance on any device.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Truck className="w-8 h-8 text-nairobi-yellow" />}
              title="Matatu Economy"
              description="Manage public transport routes. Balance the chaos of matatus with the order of the BRT system."
            />
            <FeatureCard 
              icon={<TreePine className="w-8 h-8 text-nairobi-green" />}
              title="Green Spaces"
              description="Protect Uhuru Park and Karura Forest. Balance urbanization with the need for green lungs."
            />
            <FeatureCard 
              icon={<Cpu className="w-8 h-8 text-blue-400" />}
              title="Instanced Rendering"
              description="Powered by a custom low-poly engine designed to render thousands of buildings on low-spec devices."
            />
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-slate-900 to-slate-800 border-t border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 bg-nairobi-yellow rounded-full filter blur-[120px] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Ready to become the Governor?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            No downloads required. Runs directly in your browser.
          </p>
          <Button size="lg" variant="secondary" onClick={handleStartGame} className="mx-auto">
            <MousePointer2 className="w-5 h-5 mr-2" />
            Enter Simulation
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-950 border-t border-slate-900 text-center text-slate-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Nairobi Skylines Project. Built with React & Tailwind.</p>
      </footer>
    </div>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="bg-slate-800/50 p-8 rounded-2xl border border-slate-700 hover:border-nairobi-yellow/50 transition-colors group">
    <div className="bg-slate-900 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 font-display">{title}</h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </div>
);

export default LandingScreen;