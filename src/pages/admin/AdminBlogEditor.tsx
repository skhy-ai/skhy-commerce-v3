import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Image as ImageIcon, Send } from 'lucide-react';

export const AdminBlogEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image_url: '',
        category: 'Technology',
        author: 'Skhy Team'
    });
    const [notifySubscribers, setNotifySubscribers] = useState(false);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    useEffect(() => {
        if (isEditing) {
            fetchPost();
        }
    }, [id]);

    const fetchPost = async () => {
        const { data } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single();

        if (data) {
            setForm({
                title: data.title,
                slug: data.slug,
                excerpt: data.excerpt || '',
                content: data.content || '',
                image_url: data.image_url || '',
                category: data.category || 'Technology',
                author: data.author || 'Skhy Team'
            });
        }
        setFetching(false);
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const title = e.target.value;
        setForm(prev => ({
            ...prev,
            title,
            slug: !isEditing ? generateSlug(title) : prev.slug // Only auto-generate slug on creation
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            ...form,
            updated_at: new Date().toISOString()
        };

        let error;
        if (isEditing) {
            const { error: err } = await supabase
                .from('blog_posts')
                .update(payload)
                .eq('id', id);
            error = err;
        } else {
            const { error: err } = await supabase
                .from('blog_posts')
                .insert([payload]);
            error = err;
        }

        setLoading(false);
        if (error) {
            alert('Error saving post: ' + error.message);
        } else {
            if (notifySubscribers) {
                // If notification requested, we could trigger it here or redirect to campaign manager with pre-fill.
                // For simplified UX, let's redirect to Email Campaign with a "draft" state or just alert.
                // Since automatic sending is complex (needs backend function to iterate thousands of subscribers),
                // we'll simulate by creating a draft campaign or just alert for now.

                // Better approach: Redirect to Campaign Manager with params?
                // Or just show message: "Post saved. Don't forget to send a newsletter!"
                alert('Post saved! To notify subscribers, please go to the Email Campaign Manager and select "Newsletter".');
            }
            navigate('/admin/blog');
        }
    };

    if (fetching) return <div className="p-8 text-white">Loading post...</div>;

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/blog')}
                    className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Posts
                </button>
                <h1 className="text-3xl font-bold text-white">
                    {isEditing ? 'Edit Post' : 'New Post'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Title</label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={handleTitleChange}
                            required
                            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Slug</label>
                        <input
                            type="text"
                            value={form.slug}
                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                            required
                            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500 font-mono text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Category</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500"
                        >
                            <option>Technology</option>
                            <option>Defense</option>
                            <option>AI</option>
                            <option>Company News</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">Author</label>
                        <input
                            type="text"
                            value={form.author}
                            onChange={(e) => setForm({ ...form, author: e.target.value })}
                            className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Image URL</label>
                    <div className="flex gap-4">
                        <div className="flex-1 relative">
                            <ImageIcon className="absolute left-3 top-3.5 w-5 h-5 text-gray-500" />
                            <input
                                type="url"
                                value={form.image_url}
                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                placeholder="https://..."
                                className="w-full bg-navy-900 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-turquoise-500"
                            />
                        </div>
                        {form.image_url && (
                            <img src={form.image_url} alt="Preview" className="h-12 w-12 rounded object-cover border border-white/10" />
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Excerpt (Short Summary)</label>
                    <textarea
                        value={form.excerpt}
                        onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                        rows={3}
                        className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">Content (Markdown supported)</label>
                    <textarea
                        value={form.content}
                        onChange={(e) => setForm({ ...form, content: e.target.value })}
                        rows={15}
                        className="w-full bg-navy-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-turquoise-500 font-mono text-sm"
                    />
                </div>

                <div className="flex items-center gap-3 p-4 bg-navy-900/50 rounded-lg border border-white/10">
                    <input
                        type="checkbox"
                        id="notify"
                        checked={notifySubscribers}
                        onChange={(e) => setNotifySubscribers(e.target.checked)}
                        className="w-5 h-5 rounded border-gray-600 text-turquoise-500 focus:ring-turquoise-500 focus:ring-offset-0"
                    />
                    <label htmlFor="notify" className="flex items-center gap-2 cursor-pointer select-none">
                        <Send className="w-4 h-4 text-turquoise-400" />
                        <span className="text-gray-300">Notify subscribers via email</span>
                    </label>
                </div>

                <div className="flex justify-end pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex items-center gap-2 bg-turquoise-500 hover:bg-turquoise-400 text-navy-900 font-bold px-8 py-3 rounded-lg transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                        <Save className="w-5 h-5" />
                        {loading ? 'Saving...' : 'Save Post'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AdminBlogEditor;
