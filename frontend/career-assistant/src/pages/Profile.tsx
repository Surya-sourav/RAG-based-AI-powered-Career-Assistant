import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { profileAPI } from '../lib/api';
import type { UserProfile } from '../types';
import toast from 'react-hot-toast';

export const Profile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data } = await profileAPI.get();
      setProfile(data);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      await profileAPI.update(profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center space-x-4">
          <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">My Profile</h1>
            <p className="text-sm text-gray-500">Manage your career information</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Career Goals */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Career Goals</h2>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Describe your career goals and aspirations..."
              value={profile?.careerGoals || ''}
              onChange={(e) => setProfile({ ...profile!, careerGoals: e.target.value })}
            />
          </div>

          {/* Skills */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Technical Skills</h2>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Python, JavaScript, React (comma-separated)"
              value={profile?.technicalSkills.join(', ') || ''}
              onChange={(e) =>
                setProfile({
                  ...profile!,
                  technicalSkills: e.target.value.split(',').map((s) => s.trim()),
                })
              }
            />

            <h2 className="text-lg font-semibold text-gray-900 mb-4 mt-6">Soft Skills</h2>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., Communication, Leadership, Problem-solving"
              value={profile?.softSkills.join(', ') || ''}
              onChange={(e) =>
                setProfile({
                  ...profile!,
                  softSkills: e.target.value.split(',').map((s) => s.trim()),
                })
              }
            />
          </div>

          {/* Interests */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Interests</h2>
            <input
              type="text"
              className="input-field"
              placeholder="e.g., AI, Data Science, Web Development"
              value={profile?.interests.join(', ') || ''}
              onChange={(e) =>
                setProfile({
                  ...profile!,
                  interests: e.target.value.split(',').map((s) => s.trim()),
                })
              }
            />
          </div>

          {/* Personality Insights */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personality Insights</h2>
            <textarea
              className="input-field min-h-[100px]"
              placeholder="Share any personality traits or work style preferences..."
              value={profile?.personalityInsights || ''}
              onChange={(e) =>
                setProfile({ ...profile!, personalityInsights: e.target.value })
              }
            />
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center space-x-2">
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </form>
      </main>
    </div>
  );
};
