
import React from 'react';
import { SparklesIcon } from './Icons';

const Header: React.FC = () => {
  return (
    <header className="text-center mb-10">
      <div className="flex items-center justify-center gap-4">
        <SparklesIcon className="w-10 h-10 text-sky-400" />
        <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-blue-400">
          Daily Motivation Bot
        </h1>
      </div>
      <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
        Your personal AI coach to kickstart your day with positivity and focus.
      </p>
    </header>
  );
};

export default Header;
