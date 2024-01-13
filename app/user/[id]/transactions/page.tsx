import { HeaderPage } from "@/components/header.page";
import { TransactionItem } from "@/components/transactions/transactions-item";
import supabase from "@/utils/supabase";
import { currentUser } from "@clerk/nextjs"

const RECENT_TRANSACTIONS = 20;
export default async function Page(){
  const clerkUser = await currentUser();
  const {data: transactions} = await supabase.from('transactions')
    .select(`*, coin(id,name,cmc_name)`)
    .eq('userid', clerkUser?.id)
    .order('tnx_date', {ascending: false})
    .limit(RECENT_TRANSACTIONS);
    
  return (
    <>
    <HeaderPage>
      <p className="text-center">
        {RECENT_TRANSACTIONS} recent transactions
      </p>
    </HeaderPage>
    {
      (transactions || []).map(transaction => (
        <TransactionItem transaction={transaction} key={transaction.id} />
      ))
    }</>
  )
}