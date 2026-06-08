import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';
import { Crown, Check, Shield, Smartphone, CreditCard, Lock, Sparkles, Award, Zap, Heart, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Plan {
  id: 'basic' | 'standard' | 'premium' | 'patron';
  name: string;
  price: string;
  period: string;
  description: string;
  badge?: string;
  icon: React.ComponentType<any>;
  popular?: boolean;
  features: string[];
}

const PLANS: Plan[] = [
  {
    id: 'basic',
    name: 'Standard Reader',
    price: 'SZL 0',
    period: 'forever',
    description: 'De facto access to daily Eswatini national and constituency reports.',
    icon: Shield,
    features: [
      'Standard news articles access',
      'Read and post basic comments',
      'Constituency-based reporting',
      'Ad-supported experience'
    ]
  },
  {
    id: 'standard',
    name: 'MoMo Supporter',
    price: 'SZL 45',
    period: 'month',
    description: 'Empower Swazi independent journalism with a direct digital support plan.',
    badge: 'Popular',
    popular: true,
    icon: Award,
    features: [
      'Entirely ad-free browsing experience',
      'Premium "MoMo Supporter" profile badge',
      'Access to interactive community debates',
      'Weekly summaries delivered via email',
      'Support local citizen reporters'
    ]
  },
  {
    id: 'premium',
    name: 'Eswatini Insider',
    price: 'SZL 95',
    period: 'month',
    description: 'Full regional dossiers, policy gazettes, high-integrity archives, and news tools.',
    badge: 'Pro Tier',
    icon: Crown,
    features: [
      'All MoMo Supporter benefits',
      'Early access to Government Gazettes',
      'Exclusive investigative features & dossiers',
      'AI-Powered Eswatini Audio News Briefs',
      'Direct debate voting and politician Q&A',
      'Premium Gold Crown profile badge'
    ]
  },
  {
    id: 'patron',
    name: 'Editorial Patron',
    price: 'SZL 295',
    period: 'month',
    description: 'Ultimate media philanthropy helping to keep Eswatini journalism free.',
    badge: 'VIP Patron',
    icon: Sparkles,
    features: [
      'All Eswatini Insider benefits',
      'Public listing on the "Media Patrons Board"',
      'Priority review for opinion pieces / press releases',
      'Quarterly editorial brief with the Editor-in-Chief',
      'VIP Crimson Star profile badge'
    ]
  }
];

export default function Subscription() {
  const { user, userData, loading } = useAuth();
  const navigate = useNavigate();
  
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [momoNumber, setMomoNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'plan' | 'checkout' | 'success'>('plan');

  const handleSelectPlan = (plan: Plan) => {
    if (!user) {
      toast.error('Please sign in to register a subscription');
      navigate('/login', { state: { from: '/subscription' } });
      return;
    }
    
    if (plan.id === 'basic') {
      handleFreeTier();
      return;
    }

    setSelectedPlan(plan);
    setPaymentStep('checkout');
  };

  const handleFreeTier = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        isSubscriber: false,
        subscriptionTier: 'basic'
      });
      toast.success('Your subscription is set to Standard Reader.');
      navigate('/profile');
    } catch (e) {
      toast.error('Failed to change subscription plan');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateCard = () => {
    if (!cardName.trim()) return 'Please enter the name on your card';
    if (cardNumber.replace(/\s+/g, '').length !== 16) return 'Please enter a valid 16-digit card number';
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) return 'Expiration must be in MM/YY format';
    if (cardCvv.length < 3) return 'Please enter a valid CVV';
    return null;
  };

  const validateMomo = () => {
    // Swazi MTN numbers typically start with 76, 78, 79 or +268
    const cleanNum = momoNumber.replace(/\s+/g, '').replace(/^\+268/, '');
    if (!cleanNum) return 'Please enter your MoMo number';
    if (!/^(76|78|79)\d{6}$/.test(cleanNum)) {
      return 'MoMo numbers must be valid MTN Eswatini formats (76xx xxxx, 78xx xxxx, 79xx xxxx)';
    }
    return null;
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedPlan) return;

    if (paymentMethod === 'card') {
      const cardErr = validateCard();
      if (cardErr) {
        toast.error(cardErr);
        return;
      }
    } else {
      const momoErr = validateMomo();
      if (momoErr) {
        toast.error(momoErr);
        return;
      }
    }

    setIsProcessing(true);

    if (paymentMethod === 'momo') {
      toast.info(`Sending MTN MoMo authorization prompt to +268 ${momoNumber}...`);
    } else {
      toast.info('Authorizing secure transaction with bank service...');
    }

    // Simulate 3 seconds payment approval flow
    setTimeout(async () => {
      try {
        const currentDate = new Date();
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + 1);

        await updateDoc(doc(db, 'users', user.uid), {
          isSubscriber: true,
          subscriptionTier: selectedPlan.id,
          subscriptionActiveSince: currentDate.toISOString(),
          subscriptionExpiry: expiryDate.toISOString()
        });

        toast.success(`Welcome to the Premium Circle!`);
        setIsProcessing(false);
        setPaymentStep('success');
      } catch (err) {
        toast.error('Could not authenticate subscription record with remote database');
        console.error(err);
        setIsProcessing(false);
      }
    }, 3500);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950">
        <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-950 min-h-screen py-16 text-zinc-950 dark:text-zinc-50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Hero Area */}
        <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/20 text-rose-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2 leading-none">
            <Crown size={12} className="inline" /> Premium Subscriptions
          </div>
          <h1 className="serif text-5xl sm:text-6xl font-black tracking-tighter dark:text-white leading-none">
            Support Pure Truth.<br />
            Unlock Eswatini.
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
            By choosing a premium plan, you directly fund local beat reporters, citizen journalists across our Tinkhundla, and uncover truth in the Kingdom.
          </p>
        </div>

        {/* Steps Management */}
        <AnimatePresence mode="wait">
          {paymentStep === 'plan' && (
            <motion.div
              key="plan-step"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            >
              {PLANS.map((plan) => {
                const IconComponent = plan.icon;
                const isCurrent = userData?.subscriptionTier === plan.id || 
                                  (!userData?.subscriptionTier && plan.id === 'basic');
                
                return (
                  <div
                    key={plan.id}
                    className={`rounded-[2.5rem] bg-zinc-50 dark:bg-zinc-900/50 p-8 border hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                      plan.popular 
                        ? 'border-rose-600 dark:border-rose-500 shadow-xl shadow-rose-600/[0.04]' 
                        : 'border-zinc-100 dark:border-zinc-800'
                    }`}
                  >
                    {plan.badge && (
                      <div className={`absolute top-4 right-4 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${
                        plan.popular
                          ? 'bg-rose-600 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {plan.badge}
                      </div>
                    )}

                    <div className="space-y-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        plan.popular 
                          ? 'bg-rose-600 text-white' 
                          : 'bg-white dark:bg-zinc-800 text-rose-600 border border-zinc-100 dark:border-zinc-700'
                      }`}>
                        <IconComponent size={28} />
                      </div>

                      <div className="space-y-1">
                        <h3 className="serif text-2xl font-black dark:text-white leading-none mt-2">{plan.name}</h3>
                        <p className="text-zinc-400 text-xs font-semibold uppercase tracking-wider">{plan.description}</p>
                      </div>

                      <div className="flex items-baseline gap-1 pt-2 border-t border-zinc-200/50 dark:border-zinc-800">
                        <span className="text-3xl font-black dark:text-white tracking-tight">{plan.price}</span>
                        {plan.period !== 'forever' && (
                          <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">/ {plan.period}</span>
                        )}
                      </div>

                      <ul className="space-y-3.5 pt-2">
                        {plan.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex gap-3 text-sm font-medium items-start">
                            <CheckCircle2 size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
                            <span className="text-zinc-600 dark:text-zinc-300 leading-tight">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-8 mt-6">
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={isCurrent}
                        className={`w-full py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          isCurrent
                            ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-default'
                            : plan.popular
                              ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-600/20 hover:scale-[1.02]'
                              : 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 hover:bg-zinc-800 dark:hover:bg-zinc-100 hover:scale-[1.02]'
                        }`}
                      >
                        {isCurrent ? 'Your Current Plan' : plan.id === 'basic' ? 'Select Standard' : 'Upgrade Now'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {paymentStep === 'checkout' && selectedPlan && (
            <motion.div
              key="checkout-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-4xl mx-auto bg-zinc-50 dark:bg-zinc-900/50 rounded-[3rem] border border-zinc-100 dark:border-zinc-800 p-8 sm:p-12 shadow-2xl"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
                
                {/* Checkout details left */}
                <div className="md:col-span-5 space-y-6 md:border-r border-zinc-200 dark:border-zinc-800 md:pr-12">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/10 text-rose-600 text-[9px] font-black uppercase tracking-widest leading-none">
                    Selected Offer
                  </div>
                  <div className="space-y-2">
                    <h3 className="serif text-3xl font-black dark:text-white leading-none">{selectedPlan.name}</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-medium leading-relaxed">{selectedPlan.description}</p>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-850 shadow-sm space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest">
                      <span>Monthly Fee</span>
                      <span className="text-sm font-black dark:text-white tracking-tight">{selectedPlan.price}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold text-zinc-500 uppercase tracking-widest border-t border-zinc-100 dark:border-zinc-800 pt-4">
                      <span>Total Due Today</span>
                      <span className="p-1 px-3 bg-rose-50 dark:bg-rose-950/30 text-rose-600 rounded-lg text-base font-black tracking-tight">{selectedPlan.price}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setPaymentStep('plan')}
                    className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-rose-600 transition-colors flex items-center gap-1.5"
                  >
                    ← Change Subscription Tiers
                  </button>
                </div>

                {/* Form checkout right */}
                <form onSubmit={handlePaymentSubmit} className="md:col-span-7 space-y-8">
                  <h3 className="serif text-3xl font-black dark:text-white leading-none">Payment Details</h3>
                  
                  {/* Selector for card vs momo */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('momo')}
                      className={`py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        paymentMethod === 'momo'
                          ? 'bg-rose-600 text-white shadow-lg'
                          : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-250 dark:border-zinc-700 text-zinc-650'
                      }`}
                    >
                      <Smartphone size={16} /> MTN Mobile Money
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-4 px-6 rounded-xl flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-widest transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-rose-600 text-white shadow-lg'
                          : 'bg-white dark:bg-zinc-800 hover:bg-zinc-100 border border-zinc-250 dark:border-zinc-700 text-zinc-650'
                      }`}
                    >
                      <CreditCard size={16} /> Card Payment
                    </button>
                  </div>

                  {/* Payment Inputs */}
                  <div className="space-y-6">
                    {paymentMethod === 'momo' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 bg-amber-500/10 text-amber-600 border border-amber-500/20 rounded-xl text-xs font-semibold">
                          <Smartphone size={18} className="flex-shrink-0" />
                          <p>MTN MoMo is standard inside Eswatini! Enter your number, click checkout, and look for the authentication pop-up query on your mobile device.</p>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Mobile Money Phone Number</label>
                          <div className="relative">
                            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-sm font-extrabold text-zinc-400">+268</span>
                            <input
                              type="tel"
                              value={momoNumber}
                              onChange={(e) => setMomoNumber(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.2rem] pl-20 pr-6 py-5 text-sm font-semibold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                              placeholder="7601 2345"
                              maxLength={8}
                              required
                            />
                          </div>
                          <span className="text-[10px] text-zinc-400 mt-1 block">Compatible with MTN Swaziland numbers (starts with 76, 78, 79).</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Name on Card</label>
                          <input
                            type="text"
                            value={cardName}
                            onChange={(e) => setCardName(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.2rem] px-6 py-5 text-sm font-semibold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="Sipho Mokoena"
                            required={paymentMethod === 'card'}
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Card Number</label>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
                              const matches = v.match(/\d{4,16}/g);
                              const match = (matches && matches[0]) || '';
                              const parts = [];

                              for (let i = 0, len = match.length; i < len; i += 4) {
                                parts.push(match.substring(i, i + 4));
                              }

                              if (parts.length > 0) {
                                setCardNumber(parts.join(' '));
                              } else {
                                setCardNumber(v);
                              }
                            }}
                            className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.2rem] px-6 py-5 text-sm font-semibold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                            placeholder="4000 1234 5678 9010"
                            maxLength={19}
                            required={paymentMethod === 'card'}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">Expiration Date</label>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/[^0-9]/g, '');
                                if (val.length > 2) {
                                  val = val.substring(0, 2) + '/' + val.substring(2, 4);
                                }
                                setCardExpiry(val);
                              }}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.2rem] px-6 py-5 text-sm font-semibold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                              placeholder="MM/YY"
                              maxLength={5}
                              required={paymentMethod === 'card'}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.25em] text-zinc-400">CVV</label>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                              className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-[1.2rem] px-6 py-5 text-sm font-semibold focus:ring-4 focus:ring-rose-600/10 focus:border-rose-600 outline-none dark:text-white transition-all"
                              placeholder="123"
                              maxLength={4}
                              required={paymentMethod === 'card'}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-250 dark:border-zinc-800 space-y-4">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="w-full py-5 bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-2xl disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-zinc-500 border-t-white dark:border-t-zinc-900 rounded-full animate-spin"></div>
                          Processing subscription query...
                        </>
                      ) : (
                        <>
                          <Lock size={15} /> Authenticate {selectedPlan.price} Securely
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-center text-zinc-400 font-medium">
                      Transactions authorized securely. Your data stays private. You can cancel your subscription renewal at any time inside your Profile settings.
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {paymentStep === 'success' && selectedPlan && (
            <motion.div
              key="success-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-2xl mx-auto rounded-[3.5rem] bg-zinc-950 text-white p-12 text-center border border-white/5 shadow-2xl shadow-zinc-950/40 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-rose-600"></div>
              <div className="absolute -top-32 -left-32 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-rose-600/10 rounded-full blur-3xl"></div>

              <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-rose-600/30">
                <Crown size={38} className="text-white" />
              </div>

              <div className="space-y-4 max-w-lg mx-auto">
                <span className="text-[10px] font-black uppercase tracking-[0.35em] text-rose-500">Subscription Active</span>
                <h2 className="serif text-4xl sm:text-5xl font-black italic text-white tracking-tighter leading-none">Greeting, Insider!</h2>
                <p className="text-zinc-400 text-sm leading-relaxed font-semibold">
                  Excellent choice. You have activated your <span className="text-white uppercase font-black">{selectedPlan.name}</span> benefits. Swazi independent journalism relies on citizens like you to keep reporting standard pristine.
                </p>
              </div>

              <div className="my-10 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl inline-flex flex-col gap-1 items-center max-w-sm">
                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Active Plan Code</span>
                <span className="font-mono text-xs text-rose-400 font-black tracking-widest uppercase">SUB-{Math.random().toString(36).substring(3, 9).toUpperCase()}</span>
                <span className="text-[9px] text-zinc-400 mt-1">Expiry date: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}</span>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <button
                  onClick={() => navigate('/profile')}
                  className="flex-1 py-4 bg-white text-zinc-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-100 transition-all shadow-md"
                >
                  View Profile Badges
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="flex-1 py-4 bg-zinc-900 text-zinc-300 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white hover:bg-zinc-800 transition-all"
                >
                  Go back to Homepage
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* FAQs */}
        {paymentStep === 'plan' && (
          <div className="mt-32 border-t border-zinc-200 dark:border-zinc-800 pt-20 max-w-4xl mx-auto">
            <h2 className="serif text-3xl font-black dark:text-white tracking-tight text-center mb-16">Subscription Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-2">
                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">How do I pay with MTN Mobile Money?</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">Simply input your MTN Eswatini number on the checkout form, click pay, and authorize the interactive pop-up on your device immediately. Enter your MoMo PIN to securely approve the purchase.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Can I cancel my membership anytime?</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">Yes. If you unsubscribe during your payment billing month, you will preserve all premium reader features until the exact date of your next scheduled bill period expiration.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">How do subscriptions help Swazi reporters?</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">We directly allocate 65% of all subscription revenue to the citizen bounty pool, funding targeted local Tinkhundla investigation projects and compensating on-the-scene contributors.</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-sm font-black dark:text-white uppercase tracking-wider">Is my credit card processing safe?</h4>
                <p className="text-sm text-zinc-400 font-medium leading-relaxed">Absolutely support is processed using encrypted Secure Sockets Layer protocols. None of your card numbers or billing cvvs are logged or archived in our Firebases.</p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
