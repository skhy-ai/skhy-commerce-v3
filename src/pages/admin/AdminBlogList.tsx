import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    category: string;
    published_at: string;
}

export const AdminBlogList: React.FC = () => {
    const [posts, setPosts] = useState<BlogPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        const { data } = await supabase
            .from('blog_posts')
            .select('id, title, category, published_at')
            .order('published_at', { ascending: false });

        setPosts(data || []);
        setLoading(false);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure? This action cannot be undone.')) return;

        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) {
            alert('Error deleting post: ' + error.message);
        } else {
            setPosts(posts.filter(p => p.id !== id));
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-white">Blog Posts</h1>
                <Link
                    to="/admin/blog/new"
                    className="flex items-center gap-2 bg-turquoise-500 hover:bg-turquoise-400 text-navy-900 font-bold px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Post
                </Link>
            </div>

            <div className="bg-navy-900 border border-white/10 rounded-xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-navy-950 text-gray-400 text-sm uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Title</th>
                            <th className="px-6 py-4 font-medium">Category</th>
                            <th className="px-6 py-4 font-medium">Published</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {loading ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">Loading...</td></tr>
                        ) : posts.length === 0 ? (
                            <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No posts found.</td></tr>
                        ) : (
                            posts.map((post) => (
                                <tr key={post.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 text-white font-medium">{post.title}</td>
                                    <td className="px-6 py-4 text-gray-400">{post.category}</td>
                                    <td className="px-6 py-4 text-gray-400">{new Date(post.published_at).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Link
                                                to={`/admin/blog/edit/${post.id}`}
                                                className="text-sky-400 hover:text-sky-300 transition-colors"
                                            >
                                                <Edit className="w-5 h-5" />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(post.id)}
                                                className="text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminBlogList;
