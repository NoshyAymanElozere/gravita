"use client";
import React, { useState } from 'react';
import { useApp } from '../../../store/AppContext';
import { REVIEWS, PRODUCTS } from '../../../constants/data';
import { Star, ShieldCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import SectionTitle from '../../../components/shared/SectionTitle';

export default function Reviews() {
  const { language, user, setActivePage } = useApp();
  const [reviewsList, setReviewsList] = useState(REVIEWS);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const reviewsTitle = language === 'en' ? 'Verified Skin Testimonials' : 'شهادات عملاء موثقة';
  const reviewsSub = language === 'en'
    ? 'Aura is integrated into the daily routines of over 50,000 global citizens.'
    : 'أورا جزء أساسي في الروتين اليومي لأكثر من 50,000 عميل وعميلة.';
  const verifiedBuyer = language === 'en' ? 'Verified Aura Owner' : 'مشترٍ موثق';

  // Autoplay loop effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prevIndex) => {
        // We only slide through the maximum 4 cards shown in the swiper
        const showCount = Math.min(reviewsList.length, 4);
        if (showCount <= 1) return 0;

        const nextIndex = (prevIndex + 1) % showCount;
        const el = document.getElementById('testimonials-slider');
        if (el) {
          const cardWidth = el.scrollWidth / showCount;

          el.scrollTo({
            left: language === 'en' ? nextIndex * cardWidth : -nextIndex * cardWidth,
            behavior: 'smooth'
          });
        }
        return nextIndex;
      });
    }, 3500);

    return () => clearInterval(timer);
  }, [reviewsList.length, language]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const newReview = {
      id: `rev_user_${Date.now()}`,
      author: user.name,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      rating: rating,
      date: new Date().toISOString().split('T')[0],
      commentEn: commentText,
      commentAr: commentText,
      productNameEn: 'Aura Premium Experience',
      productNameAr: 'تجربة أورا المميزة',
      verified: true,
      helpfulCount: 0
    };

    setReviewsList([newReview, ...reviewsList]);
    setCommentText('');
    setRating(5);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <SectionTitle
        subtitle={language === 'en' ? 'Aura Community Voice' : 'أصوات مجتمعنا الثمينة'}
        title={reviewsTitle}
        description={reviewsSub}
      />

      {/* Testimonials Deck (Swiper Slider) */}
      <div className="relative w-full">
        {/* Actions Header (Buttons + Write Testimonial link) */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-secondary !py-2 !px-4 !text-[10px] tracking-wider cursor-pointer font-sans uppercase font-bold flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{language === 'en' ? 'Write a Testimonial' : 'شاركينا تجربتكِ'}</span>
            <ArrowRight size={11} className="rtl:rotate-180" />
          </button>

          <div className="flex gap-2">
            <button
              onClick={() => {
                const el = document.getElementById('testimonials-slider');
                if (el) {
                  el.scrollBy({ left: language === 'en' ? -350 : 350, behavior: 'smooth' });
                }
              }}
              className="p-2 rounded-full border border-zinc-200 hover:border-brand-primary/40 hover:bg-zinc-50 text-zinc-650 transition-all cursor-pointer font-sans"
              aria-label="Previous"
            >
              <ChevronLeft size={16} className="rtl:rotate-180" />
            </button>
            <button
              onClick={() => {
                const el = document.getElementById('testimonials-slider');
                if (el) {
                  el.scrollBy({ left: language === 'en' ? 350 : -350, behavior: 'smooth' });
                }
              }}
              className="p-2 rounded-full border border-zinc-200 hover:border-brand-primary/40 hover:bg-zinc-50 text-zinc-650 transition-all cursor-pointer font-sans"
              aria-label="Next"
            >
              <ChevronRight size={16} className="rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Slider container */}
        <div
          id="testimonials-slider"
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 w-full"
        >
          {reviewsList.slice(0, 4).map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-6 border border-brand-sage-light/10 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col space-y-4 snap-start min-w-[285px] sm:min-w-[340px] max-w-[360px] flex-shrink-0"
            >
              <div className="flex items-center justify-between pb-3 border-b border-brand-sage-light/10">
                <div className="flex items-center space-x-3 rtl:space-x-reverse">
                  <img
                    src={rev.avatar}
                    alt={rev.author}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-serif text-xs font-bold text-zinc-900">{rev.author}</h4>
                    <div className="flex gap-2 items-center mt-0.5">
                      <span className="text-[9px] text-emerald-600 font-semibold font-sans uppercase flex items-center tracking-wider gap-0.5">
                        <ShieldCheck size={9} />
                        {verifiedBuyer}
                      </span>
                      <span className="text-zinc-200">|</span>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} size={8} className="fill-current" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-zinc-500 font-sans leading-relaxed flex-1 italic">
                “{language === 'en' ? rev.commentEn : rev.commentAr}”
              </p>

              <div>
                <span className="text-[9px] text-zinc-400 font-sans block pt-1 uppercase tracking-widest font-medium border-t border-zinc-100">
                  {language === 'en' ? rev.productNameEn : rev.productNameAr}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial Upload Modal Popup */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-brand-sage-light/20 rounded-2xl p-6 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative shadow-2xl space-y-4">
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-zinc-450 hover:text-zinc-650 cursor-pointer text-lg font-bold font-sans"
              type="button"
            >
              ✕
            </button>

            {user ? (
              <form onSubmit={(e) => {
                handleSubmit(e);
                setIsModalOpen(false);
              }} className="space-y-4 pt-2">
                <h3 className="font-serif text-sm font-bold text-brand-primary uppercase tracking-wider pb-2 border-b border-brand-sage-light/10">
                  {language === 'en' ? 'Share Your Skincare Testimonial' : 'شاركينا تجربتكِ مع مستحضرات أورا'}
                </h3>


                {/* Rating stars selector */}
                <div className="space-y-1">
                  <label className="input-label">
                    {language === 'en' ? 'Select Rating' : 'التقييم بالنجوم'}
                  </label>
                  <div className="flex items-center space-x-1.5 rtl:space-x-reverse pt-1">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        className="cursor-pointer transition-transform hover:scale-110 active:scale-95 p-0.5"
                      >
                        <Star
                          size={20}
                          className={
                            starVal <= rating
                              ? 'text-amber-500 fill-amber-500'
                              : 'text-zinc-300'
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="input-label">
                    {language === 'en' ? 'Your Experience / Comment' : 'تجربتكِ / تعليقكِ'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder={language === 'en' ? 'Describe your skin transformation...' : 'صفي لنا كيف تغيرت بشرتكِ للأفضل بعد استخدام المنتج...'}
                    className="input-field bg-white resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary !py-2.5 !px-5 !text-[10px] cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button type="submit" className="btn-primary w-full sm:w-auto">
                    {language === 'en' ? 'Submit Testimonial' : 'إضافة تعليق'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="text-center py-6 space-y-4">
                <ShieldCheck size={32} className="text-brand-sage-muted mx-auto" />
                <h4 className="font-serif text-xs font-bold text-brand-primary">
                  {language === 'en' ? 'Share your Aura Experience' : 'شاركينا تجربتكِ مع أورا'}
                </h4>
                <p className="text-xs text-zinc-500 font-sans max-w-sm mx-auto">
                  {language === 'en' ? 'Sign in to add a testimonial about your skincare results.' : 'سجلي الدخول لإضافة شهادتكِ وتجربتكِ الخاصة مع منتجاتنا.'}
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary !py-2.5 !px-5 !text-[10px] cursor-pointer"
                  >
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </button>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setActivePage('auth');
                    }}
                    className="btn-primary !py-2.5 !px-5 !text-[10px] cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>{language === 'en' ? 'Log In / Sign Up' : 'تسجيل الدخول / إنشاء حساب'}</span>
                    <ArrowRight size={10} className="rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
