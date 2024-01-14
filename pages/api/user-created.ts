import supabase from '@/utils/supabase';
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log(req.method);
  
  if(req.method !== 'POST'){
    res.status(403).json({message: 'Method is not allowed'});
    return;
  }
  const notiToken = req.headers['x-crypto-noti-token'];
  if(notiToken !== process.env.NEXT_PUBLIC_CRYPTO_NOTI_TOKEN){
    res.status(400).json({ message: 'Token not match!' })
    return;
  }
  const {data, type} = req.body;
  if(type !== 'user.created'){
    res.status(403).json({message: 'Event type is not allowed'});
    return;
  }
  if(!data?.id){
    res.status(404).json({message: 'user.id is not exist'});
    return;
  }
  const {data: users} = await supabase.from('users').select().eq('userid', data.id).limit(1);
  if(!!users?.length){
    res.status(404).json({message: `user.id ${data?.id} is existed`});
    return;
  }
  const {error} = await supabase.from('users').insert({
    userid: data?.id,
    name: data?.first_name + ' ' + data?.last_name
  })
  if(error){
    res.status(404).json({ message: 'Create user unsuccessfully' });
  }
  res.status(201).json({ message: `User created` })
}