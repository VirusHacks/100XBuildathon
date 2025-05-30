import { getServerSession } from 'next-auth/next';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import User from '@/models/User';
import Job from '@/models/Job';
import dbConnect from '@/lib/dbConnect';

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    await dbConnect();
    
    const jobId = params.id;
    const job = await Job.findById(jobId);
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    
    const user = await User.findOne({ email: session.user.email });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if job is already saved
    const jobIndex = user.savedJobs.indexOf(jobId);
    
    if (jobIndex === -1) {
      // Job not saved, add it
      user.savedJobs.push(jobId);
      await user.save();
      return NextResponse.json({ message: 'Job saved successfully' });
    } else {
      // Job already saved, remove it
      user.savedJobs.splice(jobIndex, 1);
      await user.save();
      return NextResponse.json({ message: 'Job unsaved successfully' });
    }
  } catch (error) {
    console.error('Error saving/unsaving job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
