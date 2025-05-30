import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import Application from '@/models/Application';
import dbConnect from '@/lib/dbConnect';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    const applications = await Application.find({ user: user._id })
      .populate('job', 'title company location type')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
