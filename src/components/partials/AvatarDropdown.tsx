import {
  ChevronDown,
  LogOut,
  MessageCircleQuestionIcon,
  Receipt,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Link, useNavigate } from "react-router";
import { useLogout } from "@/hooks/userAuthHooks";
import { toast } from "react-toastify";
import { errorTransformer } from "@/utils/error";
import Spinner from "../reusables/Spinner";

const helpLink = import.meta.env.VITE_HELP_SITE_LINK;

const AvatarDropdown = ({
  avatarTmage,
  userRole,
}: {
  avatarTmage?: string | null;
  userRole?: string;
}) => {
  const { mutate: logoutMutaion, isPending } = useLogout();
  const navigate = useNavigate();

  let profileUrl = ``;
  if (userRole) {
    switch (userRole) {
      case "superadmin":
        profileUrl = "/superadmin/profile";
        break;
      case "owner":
        profileUrl = "/store-owner/profile";
        break;
      case "manager":
        profileUrl = "/store-manager/profile";
        break;
      case "employee":
        profileUrl = "/employee/profile";
        break;
      default:
        profileUrl = "/404";
    }
  }

  const handleLogout = async () => {
    logoutMutaion(undefined, {
      onSuccess: () => {
        navigate("/");
      },
      onError: (error) => {
        const message = errorTransformer(error);
        toast.error(message);
      },
    });
  };

  if (isPending) {
    return <Spinner />;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="header-profile-btn bg-muted flex cursor-pointer items-center gap-2 rounded-4xl p-2">
          <div className="header-profile-avatar size-11 rounded-full">
            <img
              src={
                avatarTmage ? avatarTmage : "/assets/images/default_avatar.png"
              }
              className="size-full rounded-full"
              alt="avatar"
            />
          </div>
          <ChevronDown />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="header-profile-dropdown"
          sideOffset={10}
          align="end"
        >
          <DropdownMenuItem asChild>
            <Link
              to={profileUrl}
              className="flex cursor-pointer items-center gap-2"
            >
              <User />
              Profile
            </Link>
          </DropdownMenuItem>

          {userRole && userRole === "owner" && (
            <DropdownMenuItem asChild>
              <Link
                to={"/store-owner/billing"}
                className="flex cursor-pointer items-center gap-2"
              >
                <Receipt />
                Billing
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link
              to={helpLink}
              className="flex cursor-pointer items-center gap-2"
              target="_blank"
            >
              <MessageCircleQuestionIcon />
              Help
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem
            variant="destructive"
            onClick={handleLogout}
            className="cursor-pointer"
          >
            <LogOut />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default AvatarDropdown;
