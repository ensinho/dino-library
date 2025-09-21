import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // Example import path
import { ArrowRight } from 'lucide-react';   // Example import path

const CallToAction = ({ user }) => {
  return (
    <>
      {/* This entire section will only render if the user is not authenticated */}
      {!user.isAuthenticated && (
        <section className="py-20 bg-gradient-hero text-center">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Embark on a Prehistoric Journey?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join our community of researchers, educators, and dinosaur enthusiasts.
            </p>
            <Link to="/auth">
              <Button size="lg" variant="secondary" className="shadow-lg hover:scale-105 transition-all">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </section>
      )}
    </>
  );
};

export default CallToAction;