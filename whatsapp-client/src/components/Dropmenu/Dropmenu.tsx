import { createRef, forwardRef, useContext, useEffect } from "react";
import { dropDownContext } from "../../context/dropDownContext";
import { AddAvatarDropdown } from "./Components/AddAvatarDropdown";
import { ChangeAvatarDropdown } from "./Components/ChangeAvatarDropdown";
import { ChatInfoDropdown } from "./Components/ChatInfoDropdown";

export const DropMenu = () => {
  const { dropMenu }: any = useContext(dropDownContext);

  switch (dropMenu.type) {
    case "addAvatar":
      return <AddAvatarDropdown />;
    case "changeAvatar":
      return <ChangeAvatarDropdown />;
    case "chatInfo":
      return <ChatInfoDropdown />;
    default:
      return (
        <div
          style={{
            display: "none",
          }}
        />
      );
  }
};
