
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { CoinsDownload } from './coins/coins-download';
import { TransactionsDownload } from '@/app/crypto/[id]/transactions-download';
import supabase from '@/utils/supabase';

interface IHeaderProps{
  clerkUser?: any;
}

export const Header = async (props: IHeaderProps) => {
  const {clerkUser} = props;
  const {data: user} = await supabase.from('users').select().eq('userid', clerkUser?.id).single();

  return (
    <div className="flex gap-2 items-center justify-between">
      <div className="flex gap-2 items-center">
        <UserButton />
        <p>Hi {
          (clerkUser?.first_name && clerkUser?.last_name)
          ? (clerkUser?.first_name +  ' ' + clerkUser?.last_name)
          : clerkUser?.emailAddresses?.[0]?.emailAddress.split('@')?.[0]}!</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className="w-8 h-8 flex items-end flex-col-reverse rounded"
          >
            &#65049;
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <Link href={`/`}>
            <DropdownMenuItem className='cursor-pointer'>
              Home
            </DropdownMenuItem>
          </Link>
          {
            !!user && (
              <>
                <Link href={`/user/${user?.id}/transactions`}>
                  <DropdownMenuItem className='cursor-pointer'>
                    Recent transactions
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem className='cursor-pointer'>
                  <CoinsDownload userid={clerkUser?.id}/>
                </DropdownMenuItem>
                <DropdownMenuItem className='cursor-pointer'>
                  <TransactionsDownload userid={clerkUser?.id}/>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <Link href={`/user/${user?.id}/settings`} className='cursor-pointer'>
                  <DropdownMenuItem className='cursor-pointer'>
                    User settings
                  </DropdownMenuItem>
                </Link>
              </>
            )
          }
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}