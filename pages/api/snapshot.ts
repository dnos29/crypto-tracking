import { percentageProfit } from '@/helpers/calculater-helper';
import { cmcHeaders } from '@/helpers/header-helper';
import { ICoinDashboard } from '@/interfaces';
import { PROFIT_THRESHOLD } from '@/shared/constants';
import supabase from '@/utils/supabase';
import dayjs from 'dayjs';
import type { NextApiRequest, NextApiResponse } from 'next'

type ResponseData = {
  message: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  console.log('snapshot cron started...')
  const {data: users, error} = await supabase.from('users').select();
  if(!users?.length){
    console.log('No users found');
    return;
  }
  const {data: distinct_cmc_ids} = await supabase.from('distinct_cmd_ids').select();
  if(!distinct_cmc_ids?.length){
    console.error('cmc_id not found');
    return;
  }
  const allCmcIds = distinct_cmc_ids.map(i => i.cmc_id);
  const { data: marketQuote } = await fetch(`https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?id=${allCmcIds?.join(',')}&convert=USD&aux=is_active`, {
    mode: 'cors',
    headers: cmcHeaders,
  }).then((res) => res.json()).catch(err => {
    console.log(err);
  });

  const snapshot_date = dayjs().format('YYYY-MM-DD');
  for (let idxUser = 0; idxUser < users.length; idxUser++) {
    const user = users[idxUser];
    const { data: coins } = await supabase.from('coins').select().eq('userid', user?.userid).order('name', { ascending: true });
    const items: ICoinDashboard[] = [];
    const coinSnapshotItems = [];
    if(!coins?.length){
      continue;
    }
    for (let i = 0; i < coins?.length; i++) {
      const coin = coins?.[i];
      const marketPrice = marketQuote?.[coin.cmc_id.toString()]?.quote?.USD?.price;
      const estVal = marketPrice * (coin.total_amount || 0);
      const total_invested = coin.total_invested > PROFIT_THRESHOLD ? coin.total_invested : 0;
      const profit = estVal - total_invested; // whether include total_invested < 0
      const profitPercentage = percentageProfit(user.percentage_profit_formula, total_invested, estVal);
      // tha troi: total_invested < 1,
      const coinDashboard: ICoinDashboard = {
        ...coin,
        total_invested,
        marketPrice,
        avg_price: coin.total_invested <= PROFIT_THRESHOLD ? 0 : coin.avg_price,
        estVal: marketPrice * (coin.total_amount || 0),
        isProfit: coin.avg_price < marketPrice,
        profit,
        profitPercentage,
      }
      items.push({
        ...coinDashboard,
      });
      coinSnapshotItems.push({
        coin_id: coin.id,
        cmc_id: coin.cmc_id,
        cmc_name: coin.cmc_name,
        total_amount: coin.total_amount,
        avg_price: coin.avg_price,
        total_invested: coin.total_invested,
        userid: user?.userid,
        market_price: marketPrice,
        est_val: estVal,
        profit_percentage: profitPercentage,
        profit: estVal - total_invested,
        snapshot_date,
        updated_at: new Date().toISOString(),
      })
    }

    const est_value = items?.reduce((acc, coin) => acc + coin.estVal, 0) || 0;
    const profit = items?.reduce((acc, coin) => acc + coin.profit, 0) || 0;
    const invested = items?.reduce((acc, coin) => acc + coin.total_invested, 0) || 0;
    const remainUsdt = user.initial_fund - invested;
    const est_value_n_remain = est_value + remainUsdt;
    
    const {data, error} = await supabase.from('total_snapshots')
    .upsert({
      est_value,
      est_value_n_remain,
      profit,
      userid: user.userid,
      snapshot_date,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'userid, snapshot_date',
    });
    
    if (!!error) console.log(error);

    const {data: coinSnapshotsData, error: coinSnapshotData} = await supabase.from('coin_snapshots')
        .upsert(
          coinSnapshotItems, 
          {
            onConflict: 'coin_id, userid, snapshot_date'
          },
        );
  }
  res.status(200).json({ message: 'snapshot cron done...' })
}