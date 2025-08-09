'use client';
import { useState } from 'react';
import { getAuthClient } from '@/helpers/firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const auth = getAuthClient(); // 🔐 Client-side Firebase auth
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/dashboard'); // 🎯 Redirect after successful login
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
            <div className="max-w-md w-full bg-gray-900 p-8 rounded-xl shadow-lg border border-gray-800">
                <h2 className="text-3xl font-bold text-white text-center mb-6">Login</h2>

                {error && (
                    <div className="bg-red-500 text-white text-sm p-3 rounded mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-white font-semibold"
                    >
                        {loading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <p className="text-sm text-gray-400 text-center mt-4">
                    Don&apos;t have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign Up</a>
                </p>
            </div>
        </div>
    );
}
