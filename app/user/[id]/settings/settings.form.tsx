'use client';
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EPercentageProfitFormula, IUser } from "@/interfaces";
import supabase from "@/utils/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

const userSchema = z.object({
  initial_fund: z.coerce.number().min(0),
  noti_sell: z.string(),
  percentage_profit_formula: z.string(),
});
interface ISettingsFormProps{
  user?: IUser
}
export const SettingsForm = (props: ISettingsFormProps) => {
  const {user} = props;
  const router = useRouter();
  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      initial_fund: user?.initial_fund || 0,
      noti_sell: user?.noti_sell || '',
      percentage_profit_formula: user?.percentage_profit_formula || EPercentageProfitFormula.NORMAL,
    },
  });

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    const {data, error} = await supabase.from('users')
      .update({
        initial_fund: values.initial_fund,
        noti_sell: values.noti_sell,
        percentage_profit_formula: values.percentage_profit_formula,
      })
      .eq('userid', user?.userid);
    console.log('data', data);
    if(!!error){
      router.refresh();
      alert('Update unsuccessfully');
    }
    router.refresh();
    alert('Saved successfully');
  }

  if(!user){
    return (
      <div className="text-center text-gray-400 italic">User not found</div>
    )
  }
  
  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="initial_fund"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Initial fund(USDT)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter initial fund"
                    {...field}
                    type='number'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noti_sell"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel>Hightlight</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter hightlight settings"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Input multile hightlight settings. Each hightlight settings includes 3 parts: field, comparator, value(number), splited by | character.
                  List field: marketPrice, avg_price, estVal, isProfit, profit, profitPercentage. Comparators: gt,gte,lt,lte,eq(=).
                  Ex input value: profit|gte|100,profitPercentage|gte|30
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="percentage_profit_formula"
            render={({ field }) => (
              <FormItem className="mt-2">
                <FormLabel className="flex aligns-center gap-2">
                  Percentage profit formula
                </FormLabel>
                <Select onValueChange={(e) => {
                  form.setValue('percentage_profit_formula', e as EPercentageProfitFormula);
                }} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select percentage profit formular" className="capitalize" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value={EPercentageProfitFormula.NORMAL}
                      className="capitalize"
                    >
                      {EPercentageProfitFormula.NORMAL}
                    </SelectItem>
                    <SelectItem
                      value={EPercentageProfitFormula.VEBO}
                      className="capitalize"
                    >
                      {EPercentageProfitFormula.VEBO}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <div className="mt-2">
            <Button
              type="submit"
              disabled={form.formState.isSubmitting}
            >
              Save
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}