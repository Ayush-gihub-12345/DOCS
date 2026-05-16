import { X, Upload, Settings as SettingsIcon, Github, Twitter, Globe, MessageCircle } from 'lucide-react';
import { useState, useRef } from 'react';
import { ProjectSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ProjectSettings;
  onSave: (settings: ProjectSettings) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSave
}: SettingsModalProps) {
  const [projectName, setProjectName] = useState(settings.name);
  const [logo, setLogo] = useState(settings.logo);
  const [socialLinks, setSocialLinks] = useState(settings.socialLinks || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    onSave({ name: projectName, logo, socialLinks });
    onClose();
  };

  const updateSocialLink = (platform: string, value: string) => {
    setSocialLinks({ ...socialLinks, [platform]: value });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Project Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={e => setProjectName(e.target.value)}
              placeholder="Enter project name"
              className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Project Logo
            </label>
            <div className="flex items-center gap-4">
              {logo && (
                <div className="w-16 h-16 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden bg-white dark:bg-gray-800">
                  <img src={logo} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                {logo ? 'Change Logo' : 'Upload Logo'}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Recommended: Square image, 512x512px
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Social Links (Optional)
            </label>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Github className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={socialLinks.github || ''}
                  onChange={e => updateSocialLink('github', e.target.value)}
                  placeholder="https://github.com/..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Twitter className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={socialLinks.twitter || ''}
                  onChange={e => updateSocialLink('twitter', e.target.value)}
                  placeholder="https://twitter.com/..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={socialLinks.discord || ''}
                  onChange={e => updateSocialLink('discord', e.target.value)}
                  placeholder="https://discord.gg/..."
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={socialLinks.website || ''}
                  onChange={e => updateSocialLink('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              These will appear as badges in exported documentation
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
