'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, X, Bot, User } from 'lucide-react';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface AIFollowUpProps {
    reportId: string;
    testName?: string;
    onClose?: () => void;
}

export default function AIFollowUp({ reportId, testName, onClose }: AIFollowUpProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState(testName ? `Why is my ${testName} abnormal?` : '');
    const [loading, setLoading] = useState(false);

    const suggestedQuestions = [
        'What does this test measure?',
        'Should I be concerned about these results?',
        'What lifestyle changes can help improve this?',
        'When should I retest?',
    ];

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/insights/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report_id: reportId,
                    question: userMessage,
                }),
            });

            if (!response.ok) throw new Error('Failed to get response');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
        } catch (err) {
            // Fallback response for demo
            const fallbackResponse = getFallbackResponse(userMessage);
            setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
            >
                <MessageCircle className="w-6 h-6 text-white" />
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-96 h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden z-50"
        >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold">Health Assistant</h3>
                        <p className="text-xs text-zinc-400">Ask about your results</p>
                    </div>
                </div>
                <button
                    onClick={() => { setIsOpen(false); onClose?.(); }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-zinc-400" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center py-8">
                        <Bot className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                        <p className="text-zinc-400 text-sm mb-4">
                            Ask me anything about your test results
                        </p>
                        <div className="space-y-2">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => setInput(q)}
                                    className="block w-full text-left px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-zinc-300 transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}
                    >
                        {msg.role === 'assistant' && (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                <Bot className="w-4 h-4 text-white" />
                            </div>
                        )}
                        <div
                            className={`max-w-[80%] p-3 rounded-xl text-sm ${msg.role === 'user'
                                    ? 'bg-indigo-500 text-white'
                                    : 'bg-white/10 text-zinc-200'
                                }`}
                        >
                            {msg.content}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                <User className="w-4 h-4 text-white" />
                            </div>
                        )}
                    </motion.div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white/10 p-3 rounded-xl">
                            <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                        </div>
                    </div>
                )}
            </div>

            {/* Disclaimer */}
            <div className="px-4 py-2 bg-amber-500/10 border-t border-amber-500/20">
                <p className="text-xs text-amber-300">
                    ⚠️ This is not medical advice. Consult a doctor for diagnosis.
                </p>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about your results..."
                        className="flex-1 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none text-sm"
                    />
                    <button
                        onClick={handleSend}
                        disabled={loading || !input.trim()}
                        className="p-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function getFallbackResponse(question: string): string {
    const q = question.toLowerCase();

    if (q.includes('ldl') || q.includes('cholesterol')) {
        return "LDL cholesterol is often called 'bad' cholesterol because high levels can lead to buildup in your arteries. Elevated LDL can be influenced by diet, genetics, and lifestyle. Consider reducing saturated fats and increasing fiber intake. However, please consult your doctor for personalized advice.";
    }
    if (q.includes('hemoglobin') || q.includes('hb') || q.includes('anemia')) {
        return "Hemoglobin carries oxygen in your blood. Low levels may indicate anemia, which can cause fatigue and weakness. Common causes include iron deficiency, vitamin B12 deficiency, or chronic conditions. Your doctor can help determine the cause and treatment.";
    }
    if (q.includes('sugar') || q.includes('glucose') || q.includes('diabetes')) {
        return "Blood glucose levels indicate how well your body processes sugar. Elevated fasting glucose may suggest prediabetes or diabetes. Lifestyle changes like diet and exercise can help manage blood sugar. Please consult your doctor for proper evaluation.";
    }
    if (q.includes('retest') || q.includes('when')) {
        return "The timing for retesting depends on your specific results and health conditions. Generally, if values are borderline, retesting in 3-6 months is common. For concerning values, your doctor may recommend sooner follow-up.";
    }
    if (q.includes('concern') || q.includes('worried')) {
        return "It's natural to have questions about your health. While I can explain what tests measure, only your doctor can properly assess your individual situation considering your full medical history. I recommend discussing any concerns with your healthcare provider.";
    }

    return "Based on your test results, I'd recommend discussing specific concerns with your healthcare provider who can consider your complete medical history. I'm here to help explain what tests measure, but I cannot provide medical diagnoses or treatment recommendations.";
}
