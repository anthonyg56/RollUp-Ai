import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { capitalizeFirstLetter, extractInitals } from "@/lib/utils";

type Props = React.ComponentProps<typeof Avatar> & {
  avatarUrl?: string;
  email: string;
  name?: string;
};

export default function UserAvatar({ avatarUrl, email, name, ...props }: Props) {
  let initials = "";

  if (name) {
    initials = capitalizeFirstLetter(extractInitals(name));
  } else if (email) {
    initials = capitalizeFirstLetter(extractInitals(email.split('@')[0]));
  }

  return (
    <Avatar {...props} id="user-avatar">
      <AvatarImage src={avatarUrl === "/default-avatar.png" ? `/public/${avatarUrl}` : avatarUrl} />
      <AvatarFallback>
        {initials}
      </AvatarFallback>
    </Avatar>
  )
}