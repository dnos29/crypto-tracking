import { EPlatform, TPlatformColor } from "@/interfaces";

interface IPlatformItemProps {
  platform: EPlatform;
}
export const PlatformItem = (props: IPlatformItemProps) => {
  const {platform} = props;
  return (
    <span className={
      `py-px px-1 rounded-sm inline-block capitalize text-xs bg-opacity-50 font-medium ${TPlatformColor[platform]} ml-2 text-white`}>
      {platform.charAt(0)}
    </span>
  )
}