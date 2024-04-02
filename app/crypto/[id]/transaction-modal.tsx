'use client';

import * as React from "react"
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ETransactionType, ICoin, ITransaction, EPlatform } from "@/interfaces";
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { averageCoinPrice, divide, initialAmountInput, multipe, sum } from "@/helpers/calculater-helper";
import supabase from "@/utils/supabase";
import { useRouter } from "next/navigation";
import { convertDateToDateTimeLocal } from "@/helpers/time-helper";


const transactionSchema = z.object({
  platform: z.nativeEnum(EPlatform),
  tnx_date: z.string().min(1),
  type: z.nativeEnum(ETransactionType),
  amount: z.string(),
  price_at: z.string(),
  total: z.string(),
  note: z.string(),
});
interface ITransactionModalProps {
  coin: ICoin,
  transaction?: ITransaction,
  transactions: ITransaction[],
  isOpen: boolean,
}
export const TransactionModal = (props: ITransactionModalProps) => {
  const { coin, transaction, transactions, isOpen } = props;
  const [openModal, setOpenModal] = React.useState(isOpen);
  const [summary, setSummary] = React.useState('');
  const router = useRouter();
  const form = useForm<z.infer<typeof transactionSchema>>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      platform: transaction?.platform || (transactions?.pop()?.platform || EPlatform.Okx),
      tnx_date: convertDateToDateTimeLocal(transaction?.tnx_date || new Date()),
      type: transaction?.type || ETransactionType.BUY,
      amount: initialAmountInput(transaction?.type, transaction?.amount),
      price_at: transaction?.price_at.toString() || '',
      total: initialAmountInput(transaction?.type, transaction?.total),
      note: transaction?.note || '',
    }
  })
  const onSubmit = async (values: z.infer<typeof transactionSchema>) => {
    if (!coin?.userid) {
      alert('user not found');
      return;
    }
    // default is Buy
    const newTransaction: ITransaction = {
      platform: values.platform,
      tnx_date: new Date(values.tnx_date).toISOString(),
      type: values.type,
      amount: Math.abs(Number(values.amount)),
      price_at: divide(Math.abs(Number(values.total)), Math.abs(Number(values.amount))),
      total: Math.abs(Number(values.total)),
      coin: coin.id || 0,
      cmc_id: coin?.cmc_id,
      userid: coin.userid || '',
      note: values?.note || '',
      ...(transaction?.id && { id: transaction?.id }),
    }
    if(values.type === ETransactionType.SELL){
      newTransaction.amount = 0 - Math.abs(Number(values.amount));
      newTransaction.total = 0 - Math.abs(Number(values.total));
    }
    if (transaction?.id) {
      try {
        await supabase.from('transactions')
          .update(newTransaction)
          .eq('userid', transaction.userid).eq('id', transaction.id);
        const updateCoin = averageCoinPrice(
          coin,
          transactions.filter((item) => item.id !== transaction.id).concat(newTransaction),
        );
        await supabase.from('coins').update(updateCoin).eq('id', coin?.id);
        setOpenModal(false);
        router.refresh();
      } catch (error) {
        console.log(error);
      }

    } else {
      try {
        await supabase.from('transactions').insert(newTransaction);
        const updateCoin = averageCoinPrice(coin, transactions?.concat(newTransaction));
        await supabase.from('coins').update(updateCoin).eq('id', coin.id);
        setSummary(
          `Total amount: ${updateCoin.total_amount} | Avg price: ${updateCoin.avg_price} | Total invested: ${updateCoin.total_invested}`
        );
        router.refresh();
        setOpenModal(false);
      } catch (error) {
        console.log(error);
      }
    }
  }
  
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          {
            transaction?.id ? (
              <button className="w-5 h-5 text-sm bg-blue-200 rounded" onClick={() => setOpenModal(true)}>
                &#9998;
              </button>
            ) :
              (
                <div
                  onClick={() => {
                    form.reset();
                    setOpenModal(true)
                  }}
                >
                  <button className="px-2 text-sm bg-blue-200 rounded inline-block">
                    <span>&#43; Transaction</span>
                  </button>
                </div>
              )
          }
        </DialogTrigger>
        {openModal && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add transaction</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                  control={form.control}
                  name="tnx_date"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input
                          type="datetime-local"
                          placeholder="Enter tnx date"
                          value={form.getValues('tnx_date')}
                          onChange={(e) => {
                            form.setValue('tnx_date', e.target.value);
                        }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className="flex aligns-center gap-2">
                        Buy/Sell
                        <div className={`h-3 w-3 rounded ${form.getValues('type') === ETransactionType.BUY ? 'bg-teal-500' : 'bg-red-500'}`}></div>
                      </FormLabel>
                      <Select onValueChange={(e) => {
                        form.setValue('type', e as ETransactionType);
                      }} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="capitalize">
                            <SelectValue placeholder="Select transaction type" className="capitalize" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={ETransactionType.BUY}
                            className="capitalize"
                          >
                            {ETransactionType.BUY}
                          </SelectItem>
                          <SelectItem
                            value={ETransactionType.SELL}
                            className="capitalize"
                          >
                            {ETransactionType.SELL}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="total"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Total</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter total" {...field} {...field} onChange={(e) => {
                          const val = e.target.value;
                          form.setValue('total', val);
                          if (form.getValues('amount')) {
                            const price_at = divide(val, form.getValues('amount') || '0');
                            form.setValue('price_at',price_at.toString());
                          }
                        }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <Input className="mt-0.5" type="number" placeholder="Enter amount" {...field} onChange={(e) => {
                          const val = e.target.value;
                          form.setValue('amount', val);
                          if (form.getValues('total')) {
                            const price_at = divide(form.getValues('total'), val);
                            form.setValue('price_at', price_at.toString());
                          }
                        }} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price_at"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Price at</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="Enter price at" {...field} disabled/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel className="flex aligns-center gap-2">
                        Platform
                      </FormLabel>
                      <Select defaultValue={field.value} onValueChange={(val) => {
                        form.setValue('platform', val as EPlatform);
                      }}>
                        <FormControl>
                          <SelectTrigger className="capitalize">
                            <SelectValue placeholder="Select platform" className="capitalize" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={EPlatform.Okx}
                            className="capitalize"
                          >
                            {EPlatform.Okx}
                          </SelectItem>
                          <SelectItem
                            value={EPlatform.Binance}
                            className="capitalize"
                          >
                            {EPlatform.Binance}
                          </SelectItem>
                          <SelectItem
                            value={EPlatform.Mexc}
                            className="capitalize"
                          >
                            {EPlatform.Mexc}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="note"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Note</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter note" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {summary && <p className="text-sm text-gray-300">{summary}</p>}
                <div className="flex mt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    Save
                  </Button>
                  <DialogClose asChild>
                    <div>
                      <Button
                        type="button"
                        variant="secondary"
                        className="ml-2"
                        disabled={form.formState.isSubmitting}
                        onClick={() => {
                          setOpenModal(false);
                        }}>
                        Close
                      </Button>
                    </div>
                  </DialogClose>
                </div>
              </form>
            </Form>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}