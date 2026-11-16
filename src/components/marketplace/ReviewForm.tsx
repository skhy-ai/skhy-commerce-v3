import React, { useState } from 'react';
import { Star, Send, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface ReviewFormProps {
    productId: number;
    userId: string;
    onSubmitted: () => void;
    onCancel: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, userId, onSubmitted, onCancel }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (rating === 0) {
            setError('Please select a star rating.');
            return;
        }
        if (comment.length < 10) {
            setError('Please write at least 10 characters in your review.');
            return;
        }

        setSubmitting(true);
        try {
            const { error: insertError } = await supabase
                .from('product_reviews')
                .insert({
                    product_id: productId,
                    user_id: userId,
                    rating,
                    title: title.trim() || null,
                    comment: comment.trim(),
                    is_verified_purchase: false,
                    is_approved: false // Requires admin approval
                });

            if (insertError) {
                if (insertError.code === '23505') {
                    setError('You have already reviewed this product.');
                } else {
                    throw insertError;
                }
                return;
            }

            toast.success('Review submitted! It will be visible after admin approval.');
            onSubmitted();
        } catch (err) {
            console.error('Error submitting review:', err);
            setError('Failed to submit review. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-slate-900">Write a Review</h4>
                <button
                    onClick={onCancel}
                    className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Star Rating */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Rating *</label>
                    <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoverRating(star)}
                                onMouseLeave={() => setHoverRating(0)}
                                className="focus:outline-none transition-transform hover:scale-110"
                            >
                                <Star
                                    className={`w-8 h-8 transition-colors ${
                                        star <= (hoverRating || rating)
                                            ? 'text-amber-400 fill-amber-400'
                                            : 'text-slate-300'
                                    }`}
                                />
                            </button>
                        ))}
                        {rating > 0 && (
                            <span className="ml-3 text-sm text-slate-500">
                                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                            </span>
                        )}
                    </div>
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Review Title (optional)</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={200}
                        placeholder="Summarize your experience"
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent bg-white"
                    />
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Review *</label>
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Share your experience with this product (min 10 characters)"
                        rows={4}
                        className="w-full px-4 py-2 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none bg-white"
                    />
                    <p className="text-xs text-slate-400 mt-1">{comment.length}/1000 characters</p>
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{error}</p>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={submitting}
                        className="flex items-center gap-2 px-6 py-2.5 bg-sky-600 text-white rounded-lg font-bold text-sm hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2.5 text-slate-600 hover:text-slate-800 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReviewForm;
