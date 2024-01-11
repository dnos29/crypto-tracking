
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { UserButton } from '@clerk/nextjs';

interface IHeaderProps{
  clerkUser?: any;
}
export const Header = (props: IHeaderProps) => {
  const {clerkUser} = props;
  // const { user } = useUser();

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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}