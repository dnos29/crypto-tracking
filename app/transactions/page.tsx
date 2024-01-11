import { TransactionItem } from "@/components/transactions/transactions-item";
import supabase from "@/utils/supabase";
import { currentUser } from "@clerk/nextjs"

export default async function Page(){
  const clerkUser = await currentUser();
  const {data: transactions} = await supabase.from('transactions')
    .select(`*, coin(id,name,cmc_name)`)
    .eq('userid', clerkUser?.id)
    .order('tnx_date', {ascending: false})
    .limit(20);
    
  return (
    <>
    <div className="text-center">
      <p className="text-bold text-xxl mt-2">Recent Transactions</p>
    </div>
    {
      (transactions || []).map(transaction => (
        <TransactionItem transaction={transaction} key={transaction.id} />
      ))
    }</>
  )
}