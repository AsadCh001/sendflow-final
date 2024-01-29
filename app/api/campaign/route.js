import { NextResponse } from 'next/server';
import Campaign from '@/models/campaign';
import { connectMongoDB } from '@/lib/mongodb';

export async function POST(req) {

  const { method } = req;

  await connectMongoDB();
  console.log("POST Request Accepted");

  
  if (method === 'POST') {
    let campaignData = await req.json();
    console.log(campaignData);

    const schedulingDataString = JSON.stringify(campaignData.schedulingData);
    campaignData.schedulingData = schedulingDataString;
    const users = campaignData.mail;
    campaignData.user = users;
    
    try {
      const campaign = await Campaign.create(campaignData);
      return NextResponse.json({ message: 'Campaign Created', campaign }, { status: 200 });
    } catch (error) {
      console.error('Error creating campaign:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }
}



export async function GET(req) {
  let { url } = await req;
  await connectMongoDB();

  const urlParts = url.split('?');
  if (urlParts.length !== 2) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  const queryParams = new URLSearchParams(urlParts[1]);
  const mail = queryParams.get('variableName');

  if (!mail) {
    return NextResponse.json({ error: 'Email parameter missing' }, { status: 400 });
  }

  try {
    const campaigns = await Campaign.find({ user: mail });
    console.log(campaigns);
    return NextResponse.json({ campaigns });
  } catch (error) {
    console.error('Error fetching:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function DELETE(req) {
  const { method, url } = req;

  await connectMongoDB();

  if (method === 'DELETE') {
    const urlParts = url.split('?');
    if (urlParts.length !== 2) {
      return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
    }

    const queryParams = new URLSearchParams(urlParts[1]);
    const id = queryParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Campaign ID is required' }, { status: 400 });
    }
    console.log(id);

    try {
      
      await Campaign.findByIdAndDelete(id);
      return NextResponse.json({ message: 'Campaign deleted' }, { status: 200 });
    } catch (error) {
      console.error('Error deleting campaign:', error); // Log the error for debugging
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  } else {
    return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
  }
}
