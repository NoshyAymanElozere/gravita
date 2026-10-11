import React, { Suspense } from 'react';
import ProfileView from '../../src/features/profile/ProfileView';

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-zinc-500 font-sans">Loading Profile...</div>}>
      <ProfileView />
    </Suspense>
  );
}
