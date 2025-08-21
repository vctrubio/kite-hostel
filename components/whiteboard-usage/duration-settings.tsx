'use client';

import { useState, useEffect } from 'react';
import { Settings, ChevronDown, ChevronUp, Timer } from 'lucide-react';
import { formatHours } from '@/components/formatters/Duration';

interface DurationSettings {
  durationCapOne: number;
  durationCapTwo: number;
  durationCapThree: number;
}

interface DurationSettingsProps {
  onSettingsChange?: (settings: DurationSettings) => void;
}

const MIN_DURATION = 60; // 1 hour minimum
const MAX_DURATION = 360; // 6 hours maximum  
const DURATION_INCREMENT = 30; // 30 minute increments

const STORAGE_KEY = 'duration-settings';

export default function DurationSettingsComponent({ onSettingsChange }: DurationSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<DurationSettings>({
    durationCapOne: 120,   // Default: 2:00hrs for single student
    durationCapTwo: 180,   // Default: 3:00hrs for 2-3 students
    durationCapThree: 240, // Default: 4:00hrs for 4+ students
  });

  // Load settings from localStorage on mount
  useEffect(() => {
    const storedSettings = localStorage.getItem(STORAGE_KEY);
    if (storedSettings) {
      try {
        const parsed = JSON.parse(storedSettings);
        setSettings(parsed);
      } catch (error) {
        console.error('Failed to parse duration settings from localStorage:', error);
      }
    }
  }, []);

  // Save to localStorage and notify parent whenever settings change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    onSettingsChange?.(settings);
  }, [settings, onSettingsChange]);

  const adjustDuration = (key: keyof DurationSettings, increment: boolean) => {
    setSettings(prev => {
      const currentValue = prev[key];
      const adjustment = increment ? DURATION_INCREMENT : -DURATION_INCREMENT;
      const newValue = Math.max(MIN_DURATION, Math.min(MAX_DURATION, currentValue + adjustment));
      return {
        ...prev,
        [key]: newValue
      };
    });
  };

  const getDurationLabel = (duration: number) => {
    return `${formatHours(duration)}hrs`;
  };

  // Duration Controller Component
  const DurationController = ({ 
    label, 
    value, 
    settingKey 
  }: { 
    label: string; 
    value: number; 
    settingKey: keyof DurationSettings; 
  }) => (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border h-12">
      <Timer className="w-5 h-5 opacity-30" />
      <span className="text-sm font-medium min-w-[80px]">{label}</span>
      <span className="text-sm font-mono">{getDurationLabel(value)}</span>
      <div className="flex flex-col ml-auto">
        <button
          onClick={() => adjustDuration(settingKey, true)}
          className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          disabled={value >= MAX_DURATION}
        >
          <ChevronUp className="w-3 h-3" />
        </button>
        <button
          onClick={() => adjustDuration(settingKey, false)}
          className="px-2 py-1 text-xs hover:bg-background rounded transition-colors"
          disabled={value <= MIN_DURATION}
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="border border-border rounded-lg bg-card">
      <div className="p-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Duration Settings</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {getDurationLabel(settings.durationCapOne)} | {getDurationLabel(settings.durationCapTwo)} | {getDurationLabel(settings.durationCapThree)}
            </span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {isOpen && (
          <div className="mt-4 space-y-3">
            <DurationController 
              label="Private" 
              value={settings.durationCapOne} 
              settingKey="durationCapOne" 
            />
            <DurationController 
              label="Semi (2-3)" 
              value={settings.durationCapTwo} 
              settingKey="durationCapTwo" 
            />
            <DurationController 
              label="Group (4+)" 
              value={settings.durationCapThree} 
              settingKey="durationCapThree" 
            />
          </div>
        )}
      </div>
    </div>
  );
}