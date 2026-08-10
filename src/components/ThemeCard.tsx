import { useState } from 'react';
import type { Theme, Narrative } from '../models/theme.types';

interface ThemeCardProps {
  theme: Theme;
}

export default function ThemeCard({ theme }: ThemeCardProps) {
  const [likedA, setLikedA] = useState(false);
  const [likedB, setLikedB] = useState(false);
  const [isFavorite, setIsFavorite] = useState(theme.isFavorite || false);

  const renderNarrative = (narrative: Narrative, isA: boolean) => {
    const isLiked = isA ? likedA : likedB;
    const setLiked = isA ? setLikedA : setLikedB;
    
    const badgeColor = isA ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
    const activeIconColor = isA ? 'text-blue-600' : 'text-purple-600';
    
    return (
      <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
        <div>
          <div className="flex justify-between items-start mb-4">
            <span className={`px-3 py-1 text-xs font-extrabold uppercase rounded-full ${badgeColor}`}>
              {narrative.posture}
            </span>
            <span className="text-xs text-slate-500 font-medium">Por {narrative.author}</span>
          </div>
          <h4 className="text-xl font-bold text-slate-800 mb-3 leading-tight">{narrative.title}</h4>
          <p className="text-slate-600 text-sm leading-relaxed mb-6">{narrative.content}</p>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-auto">
          <button 
            onClick={() => setLiked(!isLiked)}
            className={`flex items-center space-x-2 text-sm font-bold transition-colors ${isLiked ? activeIconColor : 'text-slate-400 hover:text-slate-600'}`}
          >
            <svg className="w-5 h-5" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.514"></path>
            </svg>
            <span>{narrative.reactions + (isLiked ? 1 : 0)} Respaldos</span>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-50 rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-10 transition-transform hover:-translate-y-1 duration-300">
      <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center bg-white">
        <div>
          <span className="text-xs font-extrabold text-blue-600 tracking-wider uppercase mb-1 block">{theme.category}</span>
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">{theme.title}</h3>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className={`p-2.5 rounded-full transition-all ${isFavorite ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-red-500 hover:bg-red-50 bg-slate-50'}`}
          >
            <svg className="w-6 h-6" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
            </svg>
          </button>
        </div>
      </div>
      
      <div className="p-8 flex flex-col md:flex-row gap-6 lg:gap-10">
        {renderNarrative(theme.narrativeA, true)}
        <div className="hidden md:flex flex-col items-center justify-center opacity-20">
          <div className="w-px h-16 bg-slate-900"></div>
          <span className="my-3 font-black text-slate-900 text-lg">VS</span>
          <div className="w-px h-16 bg-slate-900"></div>
        </div>
        {renderNarrative(theme.narrativeB, false)}
      </div>
    </div>
  );
}
