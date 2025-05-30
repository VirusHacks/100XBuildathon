'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ProfileForm from '@/components/profile/ProfileForm';
// import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/signin');
    }

    // Fetch user data if authenticated
    if (status === 'authenticated') {
      fetchUserData();
    }
  }, [status, router]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/users/profile');
      setUserData(data.user);
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast.error('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        {/* <LoadingSpinner size="large" /> */}
        <p>loading</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {userData ? (
        <ProfileForm initialData={userData} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Profile not found</h2>
            <p className="mt-2 text-gray-500">Please complete your profile information</p>
            <ProfileForm initialData={{}} />
          </div>
        </div>
      )}
    </div>
  );
}
