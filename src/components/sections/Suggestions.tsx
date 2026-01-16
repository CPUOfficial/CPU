import { useState, useEffect } from 'react';
import { supabase, type Suggestion } from '../../lib/supabase';

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [newSuggestion, setNewSuggestion] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchSuggestions();

    const channel = supabase
      .channel('suggestions_changes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'suggestions' },
        (payload) => {
          setSuggestions((prev) => {
            const exists = prev.find(s => s.id === (payload.new as Suggestion).id);
            if (exists) return prev;
            return [payload.new as Suggestion, ...prev];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'suggestions' },
        () => {
          fetchSuggestions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchSuggestions = async () => {
    const { data } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSuggestions(data);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuggestion.trim()) return;

    setSubmitting(true);
    const { data, error } = await supabase.from('suggestions').insert({
      content: newSuggestion.trim(),
      username: username.trim() || null,
    }).select();

    if (!error && data) {
      setNewSuggestion('');
      setSuggestions((prev) => [data[0] as Suggestion, ...prev]);
      showNotification('SUBMISSION SUCCESSFUL');
    } else {
      showNotification('SUBMISSION FAILED');
    }
    setSubmitting(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="space-y-4">
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 border-4 border-cyan-400 p-4 text-center bg-cyan-900 bg-opacity-90 doom-badge-success shadow-lg animate-pulse">
          <div className="text-cyan-400 font-bold doom-glow text-2xl">{notification}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="doom-panel-dark">
          <div className="doom-header">
            <span>SUBMIT INPUT</span>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-gray-200 mb-2 font-bold text-lg">▸ Username (Optional)</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="doom-input w-full text-lg"
                maxLength={50}
                placeholder="ANONYMOUS"
              />
            </div>
            <div>
              <label className="block text-gray-200 mb-2 font-bold text-lg">▸ Message</label>
              <textarea
                value={newSuggestion}
                onChange={(e) => setNewSuggestion(e.target.value)}
                className="doom-input w-full h-32 resize-none text-lg"
                maxLength={500}
                required
                placeholder="Enter feedback..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="doom-button w-full disabled:opacity-50 text-lg"
            >
              {submitting ? '▸▸▸ TRANSMITTING...' : '▶ SUBMIT ◀'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 doom-panel-dark">
          <div className="doom-header">
            <span>COMMUNITY INPUT ({suggestions.length})</span>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {suggestions.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-yellow-300 font-bold doom-glow text-2xl mb-3">
                  ⚠ NO SUBMISSIONS ⚠
                </div>
                <div className="text-gray-200 text-lg">Be the first to submit feedback</div>
              </div>
            ) : (
              suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="doom-list-item"
                >
                  <div className="flex justify-between mb-2">
                    <span className="text-yellow-300 font-bold doom-glow text-lg">
                      ▸ {suggestion.username || 'ANON'}
                    </span>
                    <span className="text-gray-300 text-lg">
                      {formatDate(suggestion.created_at)}
                    </span>
                  </div>
                  <div className="text-gray-100 leading-relaxed text-lg">{suggestion.content}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
