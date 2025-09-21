import React from 'react';
import { Github, Linkedin, Mail, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => (
  <footer className="relative bg-gradient-prehistoric text-white overflow-hidden">
    {/* Animated dinosaur footprints */}
    <div className="absolute inset-0 opacity-20 pointer-events-none">
      <div className="dino-footprint footprint-1"></div>
      <div className="dino-footprint footprint-2"></div>
      <div className="dino-footprint footprint-3"></div>
      <div className="dino-footprint footprint-4"></div>
      <div className="dino-footprint footprint-5"></div>
    </div>
    {/* Floating amber particles */}
    <div className="amber-particles pointer-events-none">
      <div className="amber-particle particle-1"></div>
      <div className="amber-particle particle-2"></div>
      <div className="amber-particle particle-3"></div>
      <div className="amber-particle particle-4"></div>
    </div>
    <div className="relative z-10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold bg-gradient-amber bg-clip-text text-transparent mb-4">
              Dino Library
            </h3>
            <p className="text-white/80 mb-6 max-w-md">
              Exploring the prehistoric world through science, education, and discovery. 
              Join this fascinating journey through Jurassic times.
            </p>
            <div className="flex space-x-4">
              <a href="https://www.github.com/ensinho" target="_blank" rel="noopener noreferrer" className="social-link text-white/60 hover:text-amber transition-colors">
                <Github className="w-6 h-6" />
              </a>
              <a href="https://www.linkedin.com/in/enzoesmeraldo" target="_blank" rel="noopener noreferrer" className="social-link text-white/60 hover:text-amber transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="mailto:enzopo625@gmail.com" className="social-link text-white/60 hover:text-amber transition-colors">
                <Mail className="w-6 h-6" />
              </a>
            </div>
          </div>
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Explore</h4>
            <ul className="space-y-2">
              <li><Link to="/catalog" className="text-white/80 hover:text-amber transition-colors">Collection</Link></li>
              <li><Link to="/map" className="text-white/80 hover:text-amber transition-colors">Maps</Link></li>
              <li><Link to="/timeline" className="text-white/80 hover:text-amber transition-colors">Timeline</Link></li>
              <li><Link to="/education" className="text-white/80 hover:text-amber transition-colors">Learning</Link></li>
            </ul>
          </div>
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><a href="https://www.kaggle.com/datasets/canozensoy/dinosaur-genera-dataset?" target='_blank' className="text-white/80 hover:text-amber transition-colors">Used Data</a></li>
              {/* <li><a href="#" className="text-white/80 hover:text-amber transition-colors">API</a></li> */}
              {/* <li><a href="#" className="text-white/80 hover:text-amber transition-colors">Support</a></li> */}
              {/* <li><a href="#" className="text-white/80 hover:text-amber transition-colors">Contact</a></li> */}
            </ul>
          </div>
        </div>
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center">
          <p className="text-white/60 text-sm mb-4 md:mb-0">
            © 2025 Dino Library. Made with <Heart className="w-4 h-4 inline text-amber mx-1" /> for paleontology lovers by
            <a href="https://www.github.com/ensinho" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-amber transition-colors"> Enzo Esmeraldo</a>
          </p>
         {/* <div className="flex space-x-6 text-sm">
            <a href="#" className="text-white/60 hover:text-amber transition-colors">Privacy</a>
            <a href="#" className="text-white/60 hover:text-amber transition-colors">Terms</a>
            <a href="#" className="text-white/60 hover:text-amber transition-colors">Licenses</a>
          </div> */}
        </div>
      </div>
    </div>
    {/* Animated ground layer */}
    <div className="jurassic-ground"></div>
  </footer>
);

export default Footer;