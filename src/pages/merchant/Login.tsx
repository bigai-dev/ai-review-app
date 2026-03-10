import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';

export const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('auth_token', data.token);
                localStorage.setItem('user_role', data.user.role);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('user_id', data.user.id);
                if (data.user.profile_pic) {
                    localStorage.setItem('profile_pic', data.user.profile_pic);
                }
                window.location.href = '/admin';
            } else {
                setError(data.error || 'Login failed');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
            {/* Background - Desktop only */}
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 hidden md:block"
              style={{ backgroundImage: "url('/Anniks_16-9-logo.jpeg')" }}
            />
            <div className="absolute inset-0 bg-black/20 z-0 hidden md:block" />

            <div className="relative z-10 bg-white/95 backdrop-blur-sm p-8 rounded-xl shadow-lg w-full max-w-md border border-white/50">
                <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">Admin Login</h1>

                {error && <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4 text-sm font-medium">{error}</div>}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="admin"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            placeholder="••••••"
                        />
                    </div>

                    <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700">
                        Sign In
                    </Button>

                    <div className="text-center text-xs text-gray-400 mt-4">
                        Copyright © 2026 Big Nexis Capital Holdings
                    </div>
                </form>
            </div>
        </div>
    );
};
