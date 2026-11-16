import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import ReviewForm from './ReviewForm.tsx';

interface Review {
    id: string;
    product_id: number;
    user_id: string;
    rating: number;
    title: string | null;
    comment: string | null;
    is_verified_purchase: boolean;
    created_at: string;
    user_email?: string;
    user_name?: string;
}

interface ReviewSectionProps {
    productId: number;
}

const ReviewSection: React.FC<ReviewSectionProps> = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [userHasReviewed, setUserHasReviewed] = useState(false);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('product_reviews')
                .select('*')
                .eq('product_id', productId)
                .eq('is_approved', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setReviews(data || []);

            // Check if current user has already reviewed
            if (user) {
                const hasReview = (data || []).some(r => r.user_id === user.id);
                setUserHasReviewed(hasReview);
            }
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId, user]);

    const averageRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    const ratingDistribution = [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.rating === star).length,
        percentage: reviews.length > 0 ? (reviews.filter(r => r.rating === star).length / reviews.length) * 100 : 0
    }));

    const handleReviewSubmitted = () => {
        setShowForm(false);
        fetchReviews();
    };

    const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
        const sizeClass = size === 'lg' ? 'w-6 h-6' : 'w-4 h-4';
        return (
            <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(star => (
                    <Star
                        key={star}
                        className={`${sizeClass} ${star <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                    />
                ))}
            </div>
        );
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="mt-8" id="reviews">
            <h3 className="text-2xl font-bold text-slate-900 mb-6">Customer Reviews</h3>

            {/* Summary */}
            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 mb-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Average Rating */}
                    <div className="flex flex-col items-center justify-center">
                        <div className="text-5xl font-bold text-slate-900">{averageRating.toFixed(1)}</div>
                        <div className="mt-2">{renderStars(Math.round(averageRating), 'lg')}</div>
                        <p className="text-sm text-slate-500 mt-1">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Distribution */}
                    <div className="flex-1 space-y-2">
                        {ratingDistribution.map(({ star, count, percentage }) => (
                            <div key={star} className="flex items-center gap-3">
                                <span className="text-sm text-slate-600 w-8 text-right">{star}★</span>
                                <div className="flex-1 h-2.5 bg-slate-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 w-8">{count}</span>
                            </div>
                        ))}
                    </div>

                    {/* Write Review CTA */}
                    <div className="flex flex-col items-center justify-center">
                        {!user ? (
                            <div className="text-center">
                                <p className="text-sm text-slate-500 mb-2">Sign in to write a review</p>
                                <a
                                    href={`/login?redirect=/marketplace/product/${productId}`}
                                    className="px-4 py-2 bg-sky-600 text-white rounded-lg text-sm font-medium hover:bg-sky-700 transition-colors"
                                >
                                    Sign In
                                </a>
                            </div>
                        ) : userHasReviewed ? (
                            <p className="text-sm text-green-600 font-medium">✓ You've reviewed this product</p>
                        ) : (
                            <button
                                onClick={() => setShowForm(true)}
                                className="px-6 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 transition-colors shadow-sm"
                            >
                                Write a Review
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Review Form */}
            {showForm && user && (
                <ReviewForm
                    productId={productId}
                    userId={user.id}
                    onSubmitted={handleReviewSubmitted}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* Review List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-slate-100 rounded-lg h-28" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-500 text-lg">No reviews yet. Be the first to review this product!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div
                            key={review.id}
                            className="bg-white rounded-lg border border-slate-200 p-5 hover:shadow-sm transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {renderStars(review.rating)}
                                        {review.is_verified_purchase && (
                                            <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full border border-green-200">
                                                ✓ Verified Purchase
                                            </span>
                                        )}
                                    </div>
                                    {review.title && (
                                        <h4 className="font-semibold text-slate-900">{review.title}</h4>
                                    )}
                                </div>
                                <span className="text-xs text-slate-400">{formatDate(review.created_at)}</span>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                            )}
                            <p className="text-xs text-slate-400 mt-2">
                                {review.user_name || review.user_email || 'Anonymous'}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReviewSection;
