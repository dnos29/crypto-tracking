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
  const payload = {
    text: "adu ngon hay",
    parse_mode: "HTML",
    disable_web_page_preview: false,
    disable_notification: false,
    reply_to_message_id: null,
    chat_id: "1626137849"
  }

  const sendMessageRs = await fetch(
    `https://api.telegram.org/bot${process.env.NEXT_PUBLIC_TELE_BOT}/sendMessage`, 
  {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: new Headers({
      'Content-Type': 'application/json; charset=UTF-8'
    })
  }).then(res => res.json());
  res.status(200).json({ message: sendMessageRs?.ok ? 'Sent' : 'Failed' })
}