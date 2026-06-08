import React from 'react';
import { Send } from 'lucide-react';
import { translations } from '../utils/i18n';
import type { Language } from '../utils/i18n';

interface ChatMessage {
  id: string;
  senderName: string;
  message: string;
  timestamp: string;
}

interface ChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  senderName: string;
  lang: Language;
}

export const Chat: React.FC<ChatProps> = ({
  messages,
  onSendMessage,
  senderName,
  lang
}) => {
  const t = translations[lang];
  const [customMsg, setCustomMsg] = React.useState('');

  const quickPhrases = [
    t.niceMove,
    t.yourTurn,
    t.wellPlayed,
    "😂",
    "🔥"
  ];

  const handleSend = (msgText: string) => {
    if (!msgText.trim()) return;
    onSendMessage(msgText.trim());
    setCustomMsg('');
  };

  return (
    <div className="flex flex-col h-full bg-orange-50/75 dark:bg-[#1E1815]/30 border border-amber-900/10 dark:border-amber-800/10 rounded-xl overflow-hidden shadow-md transition-colors duration-300">
      {/* Header */}
      <div className="bg-amber-900 dark:bg-stone-950 text-amber-50 px-4 py-2 text-xs font-bold tracking-widest flex items-center justify-between transition-colors">
        <span>{t.quickChat}</span>
        <span className="opacity-55 text-[10px]">({senderName})</span>
      </div>

      {/* Messages Log */}
      <div className="flex-grow overflow-y-auto p-3 space-y-2 min-h-[60px] text-xs">
        {messages.length === 0 ? (
          <div className="text-center text-stone-400 dark:text-stone-500 italic py-4">
            {lang === 'en' ? 'No chats yet' : 'செய்திகள் எதுவும் இல்லை'}
          </div>
        ) : (
          messages.map((m) => (
            <div key={m.id} className="border-b border-amber-900/5 dark:border-stone-900/40 pb-1">
              <span className="font-bold text-amber-900 dark:text-amber-400 mr-1">{m.senderName}:</span>
              <span className="text-stone-700 dark:text-stone-300">{m.message}</span>
              <span className="text-[9px] text-stone-400 dark:text-stone-500 float-right mt-0.5">{m.timestamp}</span>
            </div>
          ))
        )}
      </div>

      {/* Quick Phrase Buttons Grid */}
      <div className="p-2 bg-stone-100 dark:bg-stone-900/50 border-t border-amber-900/5 dark:border-stone-900/40 grid grid-cols-5 gap-1">
        {quickPhrases.map((phrase, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(phrase)}
            className="py-1 px-1 text-[10px] font-semibold bg-white dark:bg-stone-850 border border-stone-200 dark:border-stone-800 hover:border-amber-900/40 dark:hover:border-amber-700/55 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded shadow-sm transition text-stone-800 dark:text-stone-200 text-center truncate"
            title={phrase}
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Custom Text Entry */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(customMsg);
        }}
        className="p-1.5 bg-white dark:bg-[#151210] border-t border-amber-900/10 dark:border-amber-800/10 flex items-center space-x-1"
      >
        <input
          type="text"
          value={customMsg}
          onChange={(e) => setCustomMsg(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-grow text-xs px-2 py-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 focus:outline-none focus:border-amber-900/45 dark:focus:border-amber-600 rounded text-stone-800 dark:text-stone-200"
        />
        <button
          type="submit"
          className="p-1.5 bg-amber-900 dark:bg-amber-800 hover:bg-amber-800 dark:hover:bg-amber-700 text-amber-50 rounded flex items-center justify-center transition"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
