import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, X, Minimize2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AiChatWidgetProps {
  selectedProjectId?: number;
  selectedWithdrawalId?: number;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({
  selectedProjectId,
  selectedWithdrawalId,
}) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [modelBadge, setModelBadge] = useState('gemini-3.6-flash');
  const [contextSummary, setContextSummary] = useState('Live Client Connection Context');
  const [suggestions, setSuggestions] = useState<string[]>([
    "What's the status of my latest withdrawal application?",
    'Which expenditure category does consultant travel fall under?',
    'What is the difference between an IBRD Loan, IDA Credit, and IDA Grant?',
  ]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'Welcome to the **Loanly Client Connection Operations Assistant** (powered by **Gemini 3.6 Flash**). Ask me about your active project ceilings, Withdrawal Application statuses, expenditure categories (Works, Goods, ConsultingServices, Training, OperatingCosts), or IBRD/IDA instruments.',
    },
  ]);

  if (!user) return null;

  const handleSend = async (promptText?: string) => {
    const text = (promptText ?? input).trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(nextMessages);
    if (!promptText) setInput('');
    setLoading(true);

    try {
      const response = await api.sendChatMessage({
        message: text,
        selectedProjectId,
        selectedWithdrawalId,
        history: nextMessages.slice(-6),
      });
      setMessages([...nextMessages, { role: 'assistant', content: response.reply }]);
      setModelBadge(response.modelUsed);
      setContextSummary(response.contextSummary);
      if (response.suggestedFollowUps?.length) {
        setSuggestions(response.suggestedFollowUps);
      }
    } catch (err) {
      setMessages([
        ...nextMessages,
        {
          role: 'assistant',
          content:
            err instanceof Error
              ? `Error communicating with assistant: ${err.message}`
              : 'Unable to reach the assistant right now.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-widget-root">
      {!isOpen ? (
        <button
          className="ai-fab-button"
          onClick={() => setIsOpen(true)}
          title="Open Gemini 3.6 Flash Operations Assistant"
        >
          <Sparkles size={18} />
          <span>Client Connection AI</span>
          <MessageSquare size={17} />
        </button>
      ) : (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-title-group">
              <div className="ai-icon-badge">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="ai-title">Client Connection Assistant</div>
                <div className="ai-subtitle">
                  {modelBadge} • {contextSummary}
                </div>
              </div>
            </div>
            <div className="ai-header-actions">
              <button className="icon-btn" onClick={() => setIsOpen(false)} title="Minimize">
                <Minimize2 size={16} />
              </button>
              <button className="icon-btn" onClick={() => setIsOpen(false)} title="Close">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="ai-chat-messages">
            {messages.map((m, idx) => (
              <div key={idx} className={`ai-msg-bubble ${m.role}`}>
                <div className="ai-msg-role">
                  {m.role === 'assistant' ? 'WB Operations AI' : user.name}
                </div>
                <div className="ai-msg-text">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ai-msg-bubble assistant">
                <div className="ai-msg-role">WB Operations AI</div>
                <div className="ai-msg-text">Analyzing live portfolio &amp; IPF guidelines...</div>
              </div>
            )}
          </div>

          <div className="ai-suggestions-strip">
            {suggestions.slice(0, 3).map((s, i) => (
              <button
                key={i}
                className="ai-suggestion-chip"
                onClick={() => handleSend(s)}
                disabled={loading}
              >
                {s}
              </button>
            ))}
          </div>

          <form
            className="ai-chat-input-bar"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about expenditure categories, WAs, or project ceilings..."
              disabled={loading}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={loading || !input.trim()}>
              <Send size={15} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
