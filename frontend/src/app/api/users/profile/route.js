import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { uploadFile, deleteFile } from '@/lib/uploadUtils';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email }).select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const formData = await request.formData();
    const userData = JSON.parse(formData.get('userData'));
    
    // Find the user
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Handle resume upload if provided
    const resumeFile = formData.get('resume');
    if (resumeFile) {
      // Delete old resume if exists
      if (user.resume && user.resume.filename) {
        await deleteFile(user.resume.filename);
      }
      
      // Upload new resume
      const resumeUpload = await uploadFile(resumeFile, 'resumes');
      userData.resume = {
        url: resumeUpload.url,
        filename: resumeUpload.filename,
        uploadDate: new Date(),
      };
    }
    
    // Handle profile image upload if provided
    const profileImageFile = formData.get('profileImage');
    if (profileImageFile) {
      // Delete old profile image if exists
      if (user.profileImage && user.profileImage.filename) {
        await deleteFile(user.profileImage.filename);
      }
      
      // Upload new profile image
      const profileImageUpload = await uploadFile(profileImageFile, 'profile_images');
      userData.profileImage = {
        url: profileImageUpload.url,
        filename: profileImageUpload.filename,
      };
    }
    
    // Handle cover image upload if provided
    const coverImageFile = formData.get('coverImage');
    if (coverImageFile) {
      // Delete old cover image if exists
      if (user.coverImage && user.coverImage.filename) {
        await deleteFile(user.coverImage.filename);
      }
      
      // Upload new cover image
      const coverImageUpload = await uploadFile(coverImageFile, 'cover_images');
      userData.coverImage = {
        url: coverImageUpload.url,
        filename: coverImageUpload.filename,
      };
    }
    
    // Update user data
    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      { $set: userData },
      { new: true }
    ).select('-password');
    
    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
