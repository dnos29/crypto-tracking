
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';
import { CoinsDownload } from './coins/coins-download';
import { TransactionsDownload } from '@/app/crypto/[id]/transactions-download';

interface IHeaderProps{
  clerkUser?: any;
}
export const Header = (props: IHeaderProps) => {
  const {clerkUser} = props;

  return (
    <div className="flex gap-2 items-center justify-between">
      <div className="flex gap-2 items-center">
        <UserButton />
        <p>Hi {clerkUser?.emailAddresses?.[0]?.emailAddress.split('@')?.[0]}!</p>
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
            <DropdownMenuItem className='pointer-cursor'>
              Home
            </DropdownMenuItem>
          </Link>
          <Link href={`/transactions`}>
            <DropdownMenuItem className='pointer-cursor'>
              Recent transactions
            </DropdownMenuItem>
          </Link>
          <DropdownMenuSeparator />
          <DropdownMenuItem className='pointer-cursor'>
            <CoinsDownload userid={clerkUser?.id}/>
          </DropdownMenuItem>
          <DropdownMenuItem className='pointer-cursor'>
            <TransactionsDownload userid={clerkUser?.id}/>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}