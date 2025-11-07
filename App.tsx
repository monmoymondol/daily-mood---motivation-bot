import React, { useState, useEffect, useCallback } from 'react';
import { getDailyMotivation } from './services/geminiService';
import { Motivation } from './types';
import Header from './components/Header';
import MotivationCard from './components/MotivationCard';
import LoadingSpinner from './components/LoadingSpinner';
import { QuoteIcon, LightbulbIcon, CheckCircleIcon, SparklesIcon, AlertTriangleIcon, GoalIcon, BellIcon } from './components/Icons';

const App: React.FC = () => {
  const [motivation, setMotivation] = useState<Motivation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userGoals, setUserGoals] = useState<string>('');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  const fetchMotivation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMotivation(null);
    try {
      const data = await getDailyMotivation(userGoals);
      setMotivation(data);
    } catch (err) {
      setError('Failed to fetch motivation. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userGoals]);

  const scheduleNextNotification = useCallback(() => {
    const existingTimeoutId = localStorage.getItem('notificationTimeoutId');
    if (existingTimeoutId) {
      clearTimeout(parseInt(existingTimeoutId));
    }

    const now = new Date();
    const nextNineAM = new Date();
    nextNineAM.setHours(9, 0, 0, 0);

    if (now > nextNineAM) {
      nextNineAM.setDate(nextNineAM.getDate() + 1);
    }

    const delay = nextNineAM.getTime() - now.getTime();

    const timeoutId = setTimeout(() => {
      const notification = new Notification('Your Daily Motivation is Ready!', {
        body: "Let's start the day with a positive boost. Click here!",
        icon: '/vite.svg',
        tag: 'daily-motivation',
      });
      notification.onclick = () => {
        window.focus();
        fetchMotivation();
      };
      // Recursively schedule the next one
      scheduleNextNotification();
    }, delay);

    localStorage.setItem('notificationTimeoutId', timeoutId.toString());
  }, [fetchMotivation]);


  const handleRequestPermission = async () => {
    setShowNotificationPrompt(false);
    if (!('Notification' in window)) {
        alert('This browser does not support desktop notification');
        return;
    }
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);
    if (permission === 'granted') {
        scheduleNextNotification();
    }
  };

  useEffect(() => {
    fetchMotivation();
    
    if ('Notification' in window) {
        const permission = Notification.permission;
        setNotificationPermission(permission);
        if (permission === 'granted') {
            scheduleNextNotification();
        } else if (permission === 'default') {
            setShowNotificationPrompt(true);
        }
    }
    
    return () => {
        const existingTimeoutId = localStorage.getItem('notificationTimeoutId');
        if (existingTimeoutId) {
            clearTimeout(parseInt(existingTimeoutId));
        }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scheduleNextNotification]);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-sky-900 text-white font-sans">
      <main className="container mx-auto px-4 py-8 md:py-12">
        <Header />

        <div className="max-w-xl mx-auto mb-8">
            <label htmlFor="user-goals" className="flex items-center gap-3 mb-2 text-lg font-medium text-sky-300">
                <GoalIcon className="w-6 h-6" />
                <span>My Goals for Today</span>
            </label>
            <textarea
                id="user-goals"
                value={userGoals}
                onChange={(e) => setUserGoals(e.target.value)}
                placeholder="e.g., finish my report, run 5k, learn a new skill..."
                className="w-full p-3 bg-slate-800/60 border border-slate-700 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors duration-200 resize-none shadow-inner"
                rows={3}
                aria-label="My Goals for Today"
            />
            <p className="text-xs text-slate-500 mt-1">Tell the AI what you want to focus on for tailored motivation.</p>
        </div>

        <div className="flex justify-center my-8">
          <button
            onClick={fetchMotivation}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-sky-500 text-white font-semibold rounded-full shadow-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-opacity-75 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:bg-sky-800 disabled:cursor-not-allowed disabled:scale-100"
          >
            {loading ? (
              <>
                <LoadingSpinner />
                <span>Generating...</span>
              </>
            ) : (
             <>
                <SparklesIcon className="w-5 h-5" />
                <span>Get New Motivation</span>
              </>
            )}
          </button>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
                <LoadingSpinner className="w-12 h-12 mx-auto mb-4" />
                <p className="text-sky-300 text-lg">Brewing some inspiration for you...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-md mx-auto bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg relative flex items-center gap-4">
             <AlertTriangleIcon className="w-6 h-6 text-red-400"/>
             <div>
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
             </div>
          </div>
        )}
        
        {!loading && motivation && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 animate-fade-in">
                <MotivationCard title="Motivational Quote" icon={<QuoteIcon className="w-8 h-8"/>}>
                    <blockquote className="text-lg italic text-slate-300">
                        "{motivation.quote.text}"
                    </blockquote>
                    <cite className="block text-right mt-4 text-sky-400 not-italic font-medium">
                        - {motivation.quote.author}
                    </cite>
                </MotivationCard>

                <MotivationCard title="Positive Thought" icon={<LightbulbIcon className="w-8 h-8"/>}>
                    <p className="text-lg text-slate-300">
                        {motivation.thought}
                    </p>
                </MotivationCard>

                <MotivationCard title="Productivity Tip" icon={<CheckCircleIcon className="w-8 h-8"/>}>
                    <p className="text-lg text-slate-300">
                        {motivation.tip}
                    </p>
                </MotivationCard>
            </div>
        )}
      </main>
       <footer className="text-center py-6 text-sm text-slate-500">
            <p>Powered by Gemini API</p>
      </footer>
      
      {showNotificationPrompt && notificationPermission === 'default' && (
        <div className="fixed bottom-4 right-4 max-w-sm bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-4 text-white z-50 animate-fade-in">
            <div className="flex items-start gap-4">
                <BellIcon className="w-8 h-8 text-sky-400 mt-1 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-lg">Get Daily Reminders</h3>
                    <p className="text-sm text-slate-300 mt-1">Enable notifications to get a reminder for your daily motivation every morning at 9 AM.</p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => setShowNotificationPrompt(false)} className="px-3 py-1 text-sm text-slate-400 hover:text-white transition-colors rounded">Later</button>
                <button onClick={handleRequestPermission} className="px-4 py-1.5 text-sm bg-sky-500 rounded-md hover:bg-sky-600 font-semibold transition-colors">Enable</button>
            </div>
        </div>
    )}
    </div>
  );
};

export default App;