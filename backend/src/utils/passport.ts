import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { User, IUser } from '../models/user.model';

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
            callbackURL: '/api/v1/auth/google/callback',
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('Google account does not have an email'));
                }

                // 1. Tìm user theo email
                let user = await User.findOne({ email });

                if (user) {
                    // Nếu đã có user, kiểm tra xem đã link với google chưa
                    const isLinked = user.auth_providers?.some(p => p.provider === 'google');
                    if (!isLinked) {
                        user.auth_providers = user.auth_providers || [];
                        user.auth_providers.push({ provider: 'google', provider_id: profile.id });
                        await user.save();
                    }
                    return done(null, user);
                }

                // 2. Nếu chưa có, tạo user mới
                user = await User.create({
                    email,
                    full_name: profile.displayName || 'Google User',
                    avatar_url: profile.photos?.[0].value || '',
                    is_active: true, // Auto active via Google
                    auth_providers: [{ provider: 'google', provider_id: profile.id }],
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

passport.use(
    new GitHubStrategy(
        {
            clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
            clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
            callbackURL: '/api/v1/auth/github/callback',
            scope: ['user:email']
        },
        async (accessToken: string, refreshToken: string, profile: any, done: any) => {
            try {
                // GitHub profile might not include email in the top level if it's private.
                // passport-github2 with 'user:email' scope usually fetches it into profile.emails
                const email = profile.emails?.[0].value;
                if (!email) {
                    return done(new Error('GitHub account does not have a public/accessible email'));
                }

                let user = await User.findOne({ email });

                if (user) {
                    const isLinked = user.auth_providers?.some(p => p.provider === 'github');
                    if (!isLinked) {
                        user.auth_providers = user.auth_providers || [];
                        user.auth_providers.push({ provider: 'github', provider_id: profile.id });
                        await user.save();
                    }
                    return done(null, user);
                }

                user = await User.create({
                    email,
                    full_name: profile.displayName || profile.username || 'GitHub User',
                    avatar_url: profile.photos?.[0].value || '',
                    is_active: true,
                    auth_providers: [{ provider: 'github', provider_id: profile.id }],
                });

                return done(null, user);
            } catch (error) {
                return done(error as Error);
            }
        }
    )
);

export default passport;
