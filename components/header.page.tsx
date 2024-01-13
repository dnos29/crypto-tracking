import Link from "next/link"

interface IHeaderPageProps{
  children: React.ReactNode
}
export const HeaderPage = ({children}: IHeaderPageProps) => {
  return (
    <div className="grid grid-row-3 grid-flow-col gap-2 items-center my-4">
      <div className="text-left">
        <Link href={'/'}>
          <button className="text-sm text-gray-400">&#9664; Home</button>
        </Link>
      </div>
      {children}
      <div className=""></div>
    </div>
  )
}