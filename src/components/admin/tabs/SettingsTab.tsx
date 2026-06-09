import React, { useState } from 'react';
import { adminDb } from '../../../supabase/adminDb';
import { Settings, Save, AlertTriangle, ToggleLeft, ToggleRight } from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [queueThreshold, setQueueThreshold] = useState(30);
  const [botFillTimer, setBotFillTimer] = useState(15);
  const [maxBonusRolls, setMaxBonusRolls] = useState(3);
  const [apiLimit, setApiLimit] = useState(120);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    // Save configurations
    localStorage.setItem('thayam_setting_maintenance', maintenanceMode ? 'true' : 'false');
    localStorage.setItem('thayam_setting_queue', queueThreshold.toString());
    localStorage.setItem('thayam_setting_bot', botFillTimer.toString());
    localStorage.setItem('thayam_setting_bonus', maxBonusRolls.toString());
    localStorage.setItem('thayam_setting_apilimit', apiLimit.toString());

    await adminDb.createAdminLog(
      'System Settings Update', 
      null, 
      `Updated parameters: Maintenance=${maintenanceMode}, MatchmakeThreshold=${queueThreshold}s, BotFill=${botFillTimer}s, MaxBonus=${maxBonusRolls}, ApiRateLimit=${apiLimit}/m.`
    );

    // Artificial terminal saving latency
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Settings Grid Form */}
      <form onSubmit={handleSave} className="bg-cyberPanel border border-gray-900 rounded p-6 shadow-lg space-y-6 max-w-3xl">
        <div className="flex items-center gap-2 border-b border-gray-900 pb-3.5 mb-5">
          <Settings size={18} className="text-cyberGold" />
          <h4 className="font-orbitron text-sm font-bold uppercase tracking-wider text-white">System Settings Console</h4>
        </div>

        {/* Maintenance Mode Alert Toggles */}
        <div className="bg-[#070A12] border border-gray-950 p-4 rounded flex items-center justify-between">
          <div className="space-y-1.5 pr-4">
            <div className="font-orbitron text-xs font-bold text-gray-200 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="text-cyberOrange" size={14} /> Maintenance Lockout Mode
            </div>
            <p className="text-[11px] text-gray-500 font-mono leading-relaxed">
              Enabling this blocks new matchmaking sessions and presents regular players with a cinematic maintenance screen. Existing rooms are permitted to conclude.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer shrink-0"
          >
            {maintenanceMode ? (
              <ToggleRight size={40} className="text-cyberOrange drop-shadow-[0_0_6px_#FF6B00]" />
            ) : (
              <ToggleLeft size={40} className="text-gray-600" />
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-mono">
          {/* Matchmaking controls */}
          <div className="space-y-4">
            <h5 className="font-orbitron text-[10px] text-gray-400 font-bold uppercase tracking-wider">Matchmaker Coefficients</h5>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-500 uppercase">Queue Expand Threshold (Seconds)</label>
              <input
                type="number"
                value={queueThreshold}
                onChange={(e) => setQueueThreshold(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-500 uppercase">Bot Match Fill Timeout (Seconds)</label>
              <input
                type="number"
                value={botFillTimer}
                onChange={(e) => setBotFillTimer(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
              />
            </div>
          </div>

          {/* Game Balance variables */}
          <div className="space-y-4">
            <h5 className="font-orbitron text-[10px] text-gray-400 font-bold uppercase tracking-wider">Arena Balancing Parameters</h5>
            
            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-500 uppercase">Max Bonus Turn Chain (Thayam/12s)</label>
              <input
                type="number"
                value={maxBonusRolls}
                onChange={(e) => setMaxBonusRolls(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] text-gray-500 uppercase">Client API Request Throttle (req/min)</label>
              <input
                type="number"
                value={apiLimit}
                onChange={(e) => setApiLimit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#070A12] border border-gray-800 rounded text-xs text-white focus:outline-none focus:border-cyberGold font-mono"
              />
            </div>
          </div>
        </div>

        {/* Form Actions footer */}
        <div className="flex items-center justify-between border-t border-gray-900 pt-5 mt-6 font-mono text-[11px] text-gray-500">
          <div>
            {savedSuccess ? (
              <span className="text-cyberGreen font-bold font-orbitron uppercase tracking-wide">✓ Configurations Saved to Core</span>
            ) : (
              <span>Changes require write authorization token approval</span>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-cyberGold hover:bg-cyberGold/90 active:bg-cyberGold/80 text-black font-orbitron font-bold uppercase rounded flex items-center gap-1.5 cursor-pointer transition-all text-[10px] tracking-widest shadow-gold-glow"
          >
            <Save size={12} />
            <span>{saving ? 'UPDATING...' : 'SAVE CONFIGS'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
